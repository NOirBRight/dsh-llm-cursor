/**
 * One DSH GenerateOptions turn: start or resume a Cursor AgentService/Run.
 */

import { create, fromBinary, toBinary } from '@bufbuild/protobuf'
import { LlmError } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, StreamChunk, TokenUsage } from '@deepseek-ai/dsh-llm'
import type { CursorCatalogModel } from './client-contract.ts'
import { handleExecServerMessage, handleKvServerMessage, writeMcpResult } from './exec.ts'
import type { PendingMcpInvocation } from './exec.ts'
import { buildConversationState, type BlobStore, type CursorImageBytes } from './history.ts'
import { findCatalogModel, resolveCursorWireId, variantMaxMode } from './catalog.ts'
import { cursorRequestHeaders } from './identity.ts'
import { InteractionMapper } from './interaction.ts'
import {
  clearPark,
  closeParkedRun,
  getParkedRun,
  pairParkResults,
  parkCompletedMcp,
  parkMatches,
  sessionKeyOf,
  type ParkedRun,
} from './park.ts'
import { grpcStatusError, isResourceExhausted, openConnectStream, RUN_PATH } from './wire/http2.ts'
import { CONNECT_END_STREAM_FLAG, frameConnectMessage, parseConnectEndStream, takeConnectFrames } from './wire/connect.ts'
import {
  AgentClientMessageSchema,
  AgentRunRequestSchema,
  AgentServerMessageSchema,
  ClientHeartbeatSchema,
  ModelDetailsSchema,
  RequestedModelSchema,
  type AgentServerMessage,
} from './wire/vendor/agent_pb.ts'

export const DEFAULT_HEARTBEAT_INTERVAL_MS = 5_000

export interface CursorRunOptions {
  apiURL: string
  accessToken: string
  catalog: readonly CursorCatalogModel[]
  heartbeatIntervalMs: number
  streamIdleTimeoutMs: number
  images?: CursorImageBytes
  debug?: (message: string) => void
}

export interface ConversationBinding {
  conversationId: string
  blobStore: BlobStore
}

const bindings = new Map<string, ConversationBinding>()

export function conversationBinding(sessionId: string | undefined): ConversationBinding {
  const key = sessionKeyOf(sessionId)
  const existing = bindings.get(key)
  if (existing !== undefined) return existing
  const created = { conversationId: crypto.randomUUID(), blobStore: new Map() }
  bindings.set(key, created)
  return created
}

export function rotateConversationId(sessionId: string | undefined): string {
  const key = sessionKeyOf(sessionId)
  const next = { conversationId: crypto.randomUUID(), blobStore: new Map() }
  bindings.set(key, next)
  return next.conversationId
}

function catalogModel(catalog: readonly CursorCatalogModel[], id: string): CursorCatalogModel | undefined {
  return findCatalogModel(catalog, id)
}

function writeAgent(stream: ParkedRun['stream'], message: ReturnType<typeof create<typeof AgentClientMessageSchema>>): void {
  stream.write(frameConnectMessage(toBinary(AgentClientMessageSchema, message)))
}

function startHeartbeat(parked: ParkedRun, intervalMs: number): void {
  if (parked.heartbeat !== undefined) clearInterval(parked.heartbeat)
  parked.heartbeat = setInterval(() => {
    if (parked.closed) return
    try {
      writeAgent(parked.stream, create(AgentClientMessageSchema, {
        message: { case: 'clientHeartbeat', value: create(ClientHeartbeatSchema, {}) },
      }))
    } catch {
      /* stream gone */
    }
  }, intervalMs)
  parked.heartbeat.unref?.()
}

function usageOf(mapper: InteractionMapper): TokenUsage {
  return { inputTokens: mapper.inputTokens, outputTokens: mapper.outputTokens }
}

async function drainWork(parked: ParkedRun): Promise<void> {
  if (parked.pendingWork.length === 0) return
  const work = parked.pendingWork.splice(0)
  await Promise.all(work)
}

function handleServerMessage(
  parked: ParkedRun,
  message: AgentServerMessage,
  tools: GenerateOptions['tools'],
  pending: PendingMcpInvocation[],
): void {
  const msgCase = message.message.case
  if (msgCase === 'kvServerMessage' && message.message.value !== undefined) {
    const kvMsg = message.message.value
    const work = Promise.resolve().then(() => {
      handleKvServerMessage(kvMsg, parked.blobStore, parked.stream)
    })
    parked.pendingWork.push(work)
    return
  }
  if (msgCase === 'execServerMessage' && message.message.value !== undefined) {
    const execMsg = message.message.value
    parked.localWork = true
    const work = Promise.resolve().then(() => {
      handleExecServerMessage(execMsg, parked.stream, tools, pending)
    })
    parked.pendingWork.push(work)
    return
  }
  if (msgCase === 'conversationCheckpointUpdate' && message.message.value !== undefined) {
    const used = message.message.value.tokenDetails?.usedTokens
    if (used !== undefined) parked.mapper.applyCheckpointUsedTokens(used)
    return
  }
  if (msgCase === 'interactionUpdate' && message.message.value !== undefined) {
    parked.mapper.handle(message.message.value)
  }
}

async function waitChunkOrIdle(parked: ParkedRun, idleMs: number): Promise<Buffer | undefined | 'idle'> {
  if (parked.localWork || idleMs <= 0) return parked.waitChunk()
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      parked.waitChunk(),
      new Promise<'idle'>((resolve) => {
        timer = setTimeout(() => { resolve('idle') }, idleMs)
        timer.unref?.()
      }),
    ])
  } finally {
    if (timer !== undefined) clearTimeout(timer)
  }
}

async function readOnePayload(parked: ParkedRun, idleMs: number): Promise<Uint8Array | 'end'> {
  for (;;) {
    const taken = takeConnectFrames(parked.inbox)
    parked.inbox = taken.rest
    const frame = taken.frames[0]
    if (frame !== undefined) {
      if (taken.frames.length > 1) {
        parked.inbox = Buffer.concat([
          ...taken.frames.slice(1).map(item => frameConnectMessage(item.payload, item.flags)),
          parked.inbox,
        ])
      }
      if ((frame.flags & CONNECT_END_STREAM_FLAG) !== 0) {
        const error = parseConnectEndStream(frame.payload)
        if (error !== null) throw error
        return 'end'
      }
      return frame.payload
    }
    const chunk = await waitChunkOrIdle(parked, idleMs)
    if (chunk === 'idle') throw new LlmError('llm-cursor: provider stream idle timeout', 'SERVER')
    if (chunk === undefined) return 'end'
    parked.inbox = Buffer.concat([parked.inbox, chunk])
  }
}

async function* continueRun(
  parked: ParkedRun,
  options: GenerateOptions,
  runtime: CursorRunOptions,
  pending: PendingMcpInvocation[],
): AsyncGenerator<StreamChunk> {
  const onAbort = (): void => {
    clearPark(options.sessionId)
  }
  options.signal?.addEventListener('abort', onAbort, { once: true })
  try {
    for (;;) {
      if (options.signal?.aborted) {
        closeParkedRun(parked)
        throw new LlmError('llm-cursor: request aborted', 'ABORTED')
      }
      const payload = await readOnePayload(parked, runtime.streamIdleTimeoutMs)
      if (payload === 'end') {
        if (options.signal?.aborted) {
          closeParkedRun(parked)
          throw new LlmError('llm-cursor: request aborted', 'ABORTED')
        }
        break
      }
      const status = parked.getHttpStatus()
      if (status === 401 || status === 403) {
        throw new LlmError('llm-cursor: Cursor session was rejected', 'AUTH', { status })
      }
      const message = fromBinary(AgentServerMessageSchema, payload)
      handleServerMessage(parked, message, options.tools, pending)
      await drainWork(parked)
      parked.localWork = false
      for (const chunk of parked.mapper.take()) yield chunk
      if (
        parked.mapper.completedMcpBlocks().length > 0
        && !parked.mapper.hasIncompleteMcp()
        && pending.length >= parked.mapper.completedMcpBlocks().length
      ) {
        parked.mapper.flushOpenText()
        for (const chunk of parked.mapper.take()) yield chunk
        parkCompletedMcp(parked, parked.mapper.completedMcpBlocks(), pending)
        startHeartbeat(parked, runtime.heartbeatIntervalMs)
        parked.localWork = true
        yield { type: 'usage', usage: usageOf(parked.mapper) }
        yield { type: 'finish', reason: { kind: 'tool-calls' } }
        return
      }
      if (parked.mapper.turnEnded) {
        await drainWork(parked)
        parked.mapper.flushOpenText()
        for (const chunk of parked.mapper.take()) yield chunk
        yield { type: 'usage', usage: usageOf(parked.mapper) }
        yield { type: 'finish', reason: { kind: 'stop' } }
        closeParkedRun(parked)
        return
      }
    }
    const trailerError = grpcStatusError(parked.trailers)
    if (trailerError !== undefined) throw trailerError
    const status = parked.getHttpStatus()
    if (status === 401 || status === 403) {
      throw new LlmError('llm-cursor: Cursor session was rejected', 'AUTH', { status })
    }
    if (!parked.mapper.turnEnded) {
      throw new LlmError('llm-cursor: stream ended before turnEnded', 'SERVER')
    }
  } catch (error) {
    if (options.signal?.aborted) {
      closeParkedRun(parked)
      throw new LlmError('llm-cursor: request aborted', 'ABORTED')
    }
    if (isResourceExhausted(error) && parked.mapper.outputTokens === 0) {
      rotateConversationId(options.sessionId)
    }
    closeParkedRun(parked)
    if (error instanceof LlmError) throw error
    const message = error instanceof Error && error.message.length > 0 ? error.message : 'Cursor Run failed'
    const code = /401|403|unauthor/iu.test(message) ? 'AUTH' : /429/.test(message) ? 'RATE_LIMIT' : 'SERVER'
    const status = /HTTP 401\b/u.test(message) || message.includes('session was rejected')
      ? 401
      : /HTTP 403\b/u.test(message)
        ? 403
        : undefined
    throw new LlmError(`llm-cursor: ${message}`, code, status === undefined ? {} : { status })
  } finally {
    options.signal?.removeEventListener('abort', onAbort)
  }
}

function buildRunRequest(
  options: GenerateOptions,
  binding: ConversationBinding,
  model: CursorCatalogModel,
  images?: CursorImageBytes,
) {
  const built = buildConversationState(
    options.messages,
    options.system,
    binding.blobStore,
    options.provider,
    options.model,
    images,
  )
  const wireId = resolveCursorWireId(model, options.reasoningEffort)
  const maxMode = variantMaxMode(model, options.reasoningEffort)
  return create(AgentRunRequestSchema, {
    conversationState: built.conversationState,
    action: built.action,
    conversationId: binding.conversationId,
    modelDetails: create(ModelDetailsSchema, {
      modelId: wireId,
      ...maxMode ? { maxMode: true } : {},
    }),
    requestedModel: create(RequestedModelSchema, {
      modelId: wireId,
      maxMode,
    }),
  })
}

export async function* runCursorTurn(
  options: GenerateOptions,
  runtime: CursorRunOptions,
): AsyncGenerator<StreamChunk> {
  if (options.stop !== undefined && options.stop.length > 0) {
    runtime.debug?.('llm-cursor: GenerateOptions.stop is ignored')
  }
  const model = catalogModel(runtime.catalog, options.model)
  if (model === undefined) {
    throw new LlmError(`llm-cursor: model ${options.model} is not in the Cursor catalog`, 'INVALID_REQUEST')
  }

  const existing = getParkedRun(options.sessionId)
  if (existing !== undefined && !existing.closed && parkMatches(existing, options.messages)) {
    existing.localWork = true
    existing.mapper = new InteractionMapper()
    const pending: PendingMcpInvocation[] = []
    for (const pair of pairParkResults(existing, options.messages)) {
      writeMcpResult(existing.stream, pair.call.pending, pair.text, pair.isError)
    }
    existing.calls = []
    yield* continueRun(existing, options, runtime, pending)
    return
  }
  if (existing !== undefined) closeParkedRun(existing)

  const binding = conversationBinding(options.sessionId)
  const opened = openConnectStream(runtime.apiURL, RUN_PATH, cursorRequestHeaders(runtime.accessToken))
  const parked: ParkedRun = {
    sessionKey: sessionKeyOf(options.sessionId),
    conversationId: binding.conversationId,
    session: opened.session,
    stream: opened.stream,
    blobStore: binding.blobStore,
    calls: [],
    mapper: new InteractionMapper(),
    localWork: false,
    closed: false,
    heartbeat: undefined,
    pendingWork: [],
    push: opened.push,
    waitChunk: opened.waitChunk,
    trailers: opened.trailers,
    getHttpStatus: opened.getHttpStatus,
    inbox: Buffer.alloc(0),
  }
  startHeartbeat(parked, runtime.heartbeatIntervalMs)
  writeAgent(parked.stream, create(AgentClientMessageSchema, {
    message: { case: 'runRequest', value: buildRunRequest(options, binding, model, runtime.images) },
  }))
  const pending: PendingMcpInvocation[] = []
  yield* continueRun(parked, options, runtime, pending)
}

