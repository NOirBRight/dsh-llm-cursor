/**
 * One DSH GenerateOptions turn: start or resume a Cursor AgentService/Run.
 */

import { create, fromBinary, toBinary } from '@bufbuild/protobuf'
import { LlmError } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, StreamChunk, TokenUsage } from '@deepseek-ai/dsh-llm'
import type { CursorCatalogModel } from './client-contract.ts'
import { handleExecServerMessage, handleKvServerMessage, writeMcpResult } from './exec.ts'
import type { PendingMcpInvocation } from './exec.ts'
import { buildConversationState, type CursorImageBytes } from './history.ts'
import { findCatalogModel, resolveCursorWireId, variantMaxMode } from './catalog.ts'
import { cursorRequestHeaders } from './identity.ts'
import { InteractionMapper } from './interaction.ts'
import {
  pairParkResults,
  parkCompletedMcp,
  parkMatches,
  type ParkedRun,
} from './park.ts'
import { CursorRunRegistry, DEFAULT_RUN_LIFECYCLE, sessionKeyOf, type ConversationBinding, type ManagedCursorRun } from './run-registry.ts'
import { grpcStatusError, isResourceExhausted, openConnectStream, RUN_PATH } from './wire/http2.ts'
import { CONNECT_END_STREAM_FLAG, CursorWireError, frameConnectMessage, parseConnectEndStream, takeConnectFrames } from './wire/connect.ts'
import {
  AgentClientMessageSchema,
  AgentRunRequestSchema,
  AgentServerMessageSchema,
  ClientHeartbeatSchema,
  ModelDetailsSchema,
  RequestedModelSchema,
  type AgentServerMessage,
} from './wire/vendor/agent_pb.ts'

export const DEFAULT_HEARTBEAT_INTERVAL_MS = DEFAULT_RUN_LIFECYCLE.heartbeatIntervalMs

export interface CursorRunOptions {
  apiURL: string
  accessToken: string
  catalog: readonly CursorCatalogModel[]
  streamIdleTimeoutMs: number
  images?: CursorImageBytes
  debug?: (message: string) => void
}

function report(runtime: CursorRunOptions, message: string): void {
  if (runtime.debug === undefined) return
  try {
    runtime.debug(message)
  } catch (diagnosticError) {
    // Provider diagnostics are observational and never change the stream result.
    void diagnosticError
  }
}

function catalogModel(catalog: readonly CursorCatalogModel[], id: string): CursorCatalogModel | undefined {
  return findCatalogModel(catalog, id)
}

function writeAgent(stream: ParkedRun['stream'], message: ReturnType<typeof create<typeof AgentClientMessageSchema>>): void {
  stream.write(frameConnectMessage(toBinary(AgentClientMessageSchema, message)))
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
    if (chunk === 'idle') throw new LlmError('llm-cursor: provider stream idle timeout', 'TIMEOUT')
    if (chunk === undefined) return 'end'
    parked.inbox = Buffer.concat([parked.inbox, chunk])
  }
}

function cursorHttpStatusError(status: number): LlmError | undefined {
  if (status === 401 || status === 403) {
    return new LlmError('llm-cursor: Cursor session was rejected', 'AUTH', { status })
  }
  if (status === 429) {
    return new LlmError('llm-cursor: Cursor session was rate limited', 'RATE_LIMIT', { status })
  }
  if (status >= 500) {
    return new LlmError('llm-cursor: Cursor service failed', 'SERVER', { status })
  }
  if (status >= 400) {
    return new LlmError('llm-cursor: Cursor request was rejected', 'INVALID_REQUEST', { status })
  }
  return undefined
}

async function* continueRun(
  run: ManagedCursorRun<ParkedRun>,
  registry: CursorRunRegistry<ParkedRun>,
  options: GenerateOptions,
  runtime: CursorRunOptions,
  pending: PendingMcpInvocation[],
): AsyncGenerator<StreamChunk> {
  const parked = run.value
  const onAbort = (): void => {
    registry.closeRun(run, 'abort')
  }
  options.signal?.addEventListener('abort', onAbort, { once: true })
  try {
    for (;;) {
      if (options.signal?.aborted) {
        registry.closeRun(run, 'abort')
        throw new LlmError('llm-cursor: request aborted', 'ABORTED')
      }
      const payload = await readOnePayload(parked, runtime.streamIdleTimeoutMs)
      if (payload === 'end') {
        if (options.signal?.aborted) {
          registry.closeRun(run, 'abort')
          throw new LlmError('llm-cursor: request aborted', 'ABORTED')
        }
        break
      }
      const statusError = cursorHttpStatusError(parked.getHttpStatus())
      if (statusError !== undefined) throw statusError
      const message = fromBinary(AgentServerMessageSchema, payload)
      handleServerMessage(parked, message, options.tools, pending)
      await drainWork(parked)
      for (const chunk of parked.mapper.take()) yield chunk
      if (
        parked.mapper.completedMcpBlocks().length > 0
        && !parked.mapper.hasIncompleteMcp()
        && pending.length >= parked.mapper.completedMcpBlocks().length
      ) {
        parked.mapper.flushOpenText()
        for (const chunk of parked.mapper.take()) yield chunk
        parkCompletedMcp(parked, parked.mapper.completedMcpBlocks(), pending)
        registry.park(run)
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
        registry.closeRun(run, 'turn-end')
        return
      }
    }
    const trailerError = grpcStatusError(parked.trailers)
    if (trailerError !== undefined) throw trailerError
    const statusError = cursorHttpStatusError(parked.getHttpStatus())
    if (statusError !== undefined) throw statusError
    if (!parked.mapper.turnEnded) {
      throw new LlmError('llm-cursor: stream ended before turnEnded', 'TRANSPORT')
    }
  } catch (error) {
    if (options.signal?.aborted) {
      registry.closeRun(run, 'abort')
      throw new LlmError('llm-cursor: request aborted', 'ABORTED')
    }
    if (isResourceExhausted(error) && parked.mapper.outputTokens === 0) {
      registry.rotateBinding(options.sessionId)
    }
    registry.closeRun(run, isResourceExhausted(error) ? 'resource-exhausted' : 'stream-error')
    if (error instanceof LlmError) throw error
    if (error instanceof CursorWireError) {
      if (['canceled', '1'].includes(error.wireCode)) {
        throw new LlmError(`llm-cursor: ${error.message}`, 'ABORTED')
      }
      if (['permission_denied', '7', 'unauthenticated', '16'].includes(error.wireCode)) {
        const status = ['unauthenticated', '16'].includes(error.wireCode) ? 401 : 403
        throw new LlmError(`llm-cursor: ${error.message}`, 'AUTH', { status })
      }
      if (['invalid_argument', '3'].includes(error.wireCode)) {
        throw new LlmError(`llm-cursor: ${error.message}`, 'INVALID_REQUEST')
      }
      if (['deadline_exceeded', '4'].includes(error.wireCode)) {
        throw new LlmError(`llm-cursor: ${error.message}`, 'TIMEOUT')
      }
    }
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
    if (run.state === 'active') registry.closeRun(run, 'stream-end')
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

/**
 * Start or atomically resume one Cursor provider Run for a DSH model request.
 * @param options - immutable model request and optional cancellation signal.
 * @param runtime - request-scoped endpoint, credential, catalog, and timeout values.
 * @param registry - adapter-owned lifecycle registry shared by its requests.
 * @returns streamed DSH chunks ending in a stop or tool-calls finish.
 */
export async function* runCursorTurn(
  options: GenerateOptions,
  runtime: CursorRunOptions,
  registry: CursorRunRegistry<ParkedRun>,
): AsyncGenerator<StreamChunk> {
  if (options.stop !== undefined && options.stop.length > 0) {
    report(runtime, 'llm-cursor: GenerateOptions.stop is ignored')
  }
  const model = catalogModel(runtime.catalog, options.model)
  if (model === undefined) {
    throw new LlmError(`llm-cursor: model ${options.model} is not in the Cursor catalog`, 'INVALID_REQUEST')
  }

  const existing = registry.claimParked(options.sessionId, parked => parkMatches(parked, options.messages))
  if (existing !== undefined) {
    const parked = existing.value
    parked.mapper = new InteractionMapper()
    const pending: PendingMcpInvocation[] = []
    let resumed = true
    try {
      if (parked.closed || parked.stream.closed || parked.stream.destroyed) throw new Error('parked stream is closed')
      for (const pair of pairParkResults(parked, options.messages)) {
        writeMcpResult(parked.stream, pair.call.pending, pair.text, pair.isError)
      }
      parked.calls = []
    } catch (error) {
      resumed = false
      registry.closeRun(existing, 'stream-error')
      report(runtime, `llm-cursor: parked Run resume fell back error=${error instanceof Error ? error.name : 'unknown'}`)
    }
    if (resumed) {
      yield* continueRun(existing, registry, options, runtime, pending)
      return
    }
  }
  registry.closeParkedRuns(options.sessionId, 'park-mismatch')

  const run = registry.openRun(options.sessionId, (binding) => {
    const opened = openConnectStream(runtime.apiURL, RUN_PATH, cursorRequestHeaders(runtime.accessToken))
    const parked: ParkedRun = {
      sessionKey: sessionKeyOf(options.sessionId),
      conversationId: binding.conversationId,
      session: opened.session,
      stream: opened.stream,
      blobStore: binding.blobStore,
      calls: [],
      mapper: new InteractionMapper(),
      closed: false,
      pendingWork: [],
      push: opened.push,
      waitChunk: opened.waitChunk,
      trailers: opened.trailers,
      getHttpStatus: opened.getHttpStatus,
      inbox: Buffer.alloc(0),
    }
    return {
      value: parked,
      close: () => {
        parked.closed = true
        try {
          parked.stream.destroy()
        } catch (error) {
          report(runtime, `llm-cursor: stream destroy failed error=${error instanceof Error ? error.name : 'unknown'}`)
        }
        try {
          parked.session.destroy()
        } catch (error) {
          report(runtime, `llm-cursor: session destroy failed error=${error instanceof Error ? error.name : 'unknown'}`)
        }
      },
      heartbeat: () => {
        writeAgent(parked.stream, create(AgentClientMessageSchema, {
          message: { case: 'clientHeartbeat', value: create(ClientHeartbeatSchema, {}) },
        }))
      },
      isClosed: () => parked.closed || parked.stream.closed || parked.stream.destroyed,
    }
  })
  const parked = run.value
  parked.stream.once('error', () => { registry.closeRun(run, 'stream-error') })
  parked.stream.once('close', () => {
    if (run.state === 'parked') registry.closeRun(run, 'stream-end')
  })
  try {
    writeAgent(parked.stream, create(AgentClientMessageSchema, {
      message: { case: 'runRequest', value: buildRunRequest(options, run.binding, model, runtime.images) },
    }))
  } catch (error) {
    registry.closeRun(run, 'stream-error')
    throw error
  }
  const pending: PendingMcpInvocation[] = []
  yield* continueRun(run, registry, options, runtime, pending)
}
