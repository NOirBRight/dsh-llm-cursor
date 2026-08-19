import { afterEach, describe, expect, it } from 'vitest'
import { LlmError, ReasoningEffortId, resolveRetryPolicy } from '@deepseek-ai/dsh-llm'
import type { AttachmentStore } from '@deepseek-ai/dsh-attachment'
import { CursorAdapter } from '../src/adapter.ts'
import { resolveAdapterOptions } from '../src/index.ts'
import type { CursorConnectionOptions } from '../src/adapter.ts'
import { groupCursorModels } from '../src/catalog.ts'
import { CURSOR_CATALOG, CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS, CURSOR_MCP_PROVIDER_ID } from '../src/client-contract.ts'
import { CURSOR_CLIENT_VERSION } from '../src/identity.ts'
import { conversationBinding, rotateConversationId } from '../src/run.ts'
import { clearPark, getParkedRun } from '../src/park.ts'
import {
  bashExec,
  closeFakeRunServers,
  connectError,
  connectExhausted,
  fakeRunServer,
  getBlob,
  listMcpResources,
  mcpCompleted,
  mcpInvoke,
  mcpPartial,
  mcpProbe,
  mcpStarted,
  requestContext,
  sendServer,
  serverOwnedTool,
  textDelta,
  thinkingDelta,
  tokenDelta,
  turnEnded,
} from './fake-run-server.ts'
import { assistantText, assistantToolCall, collect, pngRef, request, toolResult, userImage, userText } from './helpers.ts'

afterEach(async () => {
  clearPark('s1')
  clearPark(undefined)
  await closeFakeRunServers()
})

const POLICY = resolveRetryPolicy({ mode: 'normal', maxRetries: 8 }, 'test')

function connection(overrides: Partial<CursorConnectionOptions> = {}): CursorConnectionOptions {
  return {
    apiURL: 'http://127.0.0.1',
    models: CURSOR_CATALOG,
    streamIdleTimeoutMs: CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS,
    heartbeatIntervalMs: 30,
    retryPolicy: POLICY,
    ...overrides,
  }
}

function adapter(
  apiURL: string,
  resolveApiKey: () => Promise<string> = () => Promise.resolve('test-access'),
  overrides: Partial<CursorConnectionOptions> = {},
) {
  return new CursorAdapter({
    options: () => connection({ apiURL, ...overrides }),
    resolveApiKey,
  })
}

const weather = {
  name: 'get_weather',
  description: 'Look up the weather',
  parameters: { type: 'object', properties: { city: { type: 'string' } } },
}

async function waitUntil(pred: () => boolean, timeoutMs = 2000): Promise<void> {
  const start = Date.now()
  while (!pred()) {
    if (Date.now() - start > timeoutMs) throw new Error('waitUntil timeout')
    await new Promise(resolve => { setTimeout(resolve, 10) })
  }
}

describe('CursorAdapter', () => {
  it('resolves the host default and an explicit eight-retry policy', () => {
    expect(resolveAdapterOptions({}).retryPolicy).toMatchObject({ mode: 'normal', maxRetries: 2 })
    expect(resolveAdapterOptions({
      retryPolicy: { mode: 'normal', maxRetries: 8 },
    }).retryPolicy).toMatchObject({ mode: 'normal', maxRetries: 8 })
  })

  it('exposes an eight-retry provider policy', () => {
    expect(adapter('http://127.0.0.1').providerRetryPolicy('cursor')).toMatchObject({
      mode: 'normal',
      maxRetries: 8,
    })
  })

  it('fails MISSING_CREDENTIAL when unsigned in', async () => {
    const cursor = adapter('http://127.0.0.1:1', () => Promise.reject(new LlmError('no', 'MISSING_CREDENTIAL')))
    await expect(collect(cursor.stream(request()))).rejects.toMatchObject({ code: 'MISSING_CREDENTIAL' })
  })

  it('streams text, thinking, heartbeat, KV, and required headers', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      expect(capture.headers['x-ghost-mode']).toBe('true')
      expect(capture.headers['x-cursor-client-type']).toBe('cli')
      expect(capture.headers['x-cursor-client-version']).toBe(CURSOR_CLIENT_VERSION)
      expect(String(capture.headers['x-dsh-plugin'] ?? '')).toContain('dsh-llm-cursor/')
      expect(capture.runRequest?.requestedModel?.modelId).toBe('composer-2.5')
      expect(capture.runRequest?.conversationState?.rootPromptMessagesJson.length).toBeGreaterThan(0)
      const blobId = capture.runRequest?.conversationState?.rootPromptMessagesJson[0]
      sendServer(stream, requestContext())
      if (blobId !== undefined) sendServer(stream, getBlob(blobId))
      sendServer(stream, thinkingDelta('hmm'))
      sendServer(stream, textDelta('hello'))
      sendServer(stream, tokenDelta(3))
      await waitUntil(() => capture.messages.some(message => message.message.case === 'clientHeartbeat'))
      await waitUntil(() => capture.messages.some(message => message.message.case === 'kvClientMessage'))
      await waitUntil(() => capture.messages.some(message => message.message.case === 'execClientMessage'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const chunks = await collect(adapter(fake.origin).stream(request({
      system: 'Be helpful.',
      sessionId: 's1' as never,
      tools: [weather],
    })))
    expect(chunks.some(chunk => chunk.type === 'reasoning-delta' && chunk.text === 'hmm')).toBe(true)
    expect(chunks.some(chunk => chunk.type === 'text-delta' && chunk.text === 'hello')).toBe(true)
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'stop' } })
    const capture = fake.captures[0]!
    expect(capture.messages.some(message => message.message.case === 'clientHeartbeat')).toBe(true)
    const kv = capture.messages.find(message => (
      message.message.case === 'kvClientMessage'
      && message.message.value.message.case === 'getBlobResult'
    ))
    const blobData = kv?.message.case === 'kvClientMessage' && kv.message.value.message.case === 'getBlobResult'
      ? kv.message.value.message.value.blobData
      : undefined
    expect(new TextDecoder().decode(blobData)).toContain('Be helpful.')
    const context = capture.messages.find(message => (
      message.message.case === 'execClientMessage'
      && message.message.value.message.case === 'requestContextResult'
    ))
    const tools = context?.message.case === 'execClientMessage'
      && context.message.value.message.case === 'requestContextResult'
      && context.message.value.message.value.result.case === 'success'
      ? context.message.value.message.value.result.value.requestContext?.tools ?? []
      : []
    expect(tools.map(tool => tool.name)).toEqual(['get_weather'])
    expect(tools.every(tool => tool.providerIdentifier === CURSOR_MCP_PROVIDER_ID)).toBe(true)
    expect(tools.some(tool => tool.name === 'bash')).toBe(false)
  })

  it('emits suffix-only arguments for cumulative args_text_delta and parks the Run', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, mcpInvoke('get_weather', 'mcp-1'))
      sendServer(stream, mcpStarted('env-1', 'get_weather', 'mcp-1'))
      sendServer(stream, mcpPartial('env-1', '{"city":', 'get_weather', 'mcp-1'))
      sendServer(stream, mcpPartial('env-1', '{"city":"Paris"}', 'get_weather', 'mcp-1'))
      sendServer(stream, mcpCompleted('env-1', 'get_weather', 'mcp-1'))
      await waitUntil(() => capture.messages.some(message => (
        message.message.case === 'execClientMessage'
        && message.message.value.message.case === 'mcpResult'
      )))
      sendServer(stream, textDelta('done'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const cursor = adapter(fake.origin)
    const first = await collect(cursor.stream(request({
      sessionId: 's1' as never,
      tools: [weather],
    })))
    const deltas = first.filter(chunk => chunk.type === 'tool-call-delta').map(chunk => chunk.argumentsDelta)
    expect(deltas.join('')).toBe('{"city":"Paris"}')
    expect(deltas.some(delta => delta.includes('{"city":{"city":'))).toBe(false)
    expect(first.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'tool-calls' } })
    expect(fake.captures).toHaveLength(1)

    const second = await collect(cursor.stream(request({
      sessionId: 's1' as never,
      tools: [weather],
      messages: [
        userText('hi'),
        assistantToolCall('env-1', 'get_weather', '{"city":"Paris"}'),
        toolResult('env-1', 'sunny'),
      ],
    })))
    expect(second.some(chunk => chunk.type === 'text-delta' && chunk.text === 'done')).toBe(true)
    expect(second.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'stop' } })
    expect(fake.captures).toHaveLength(1)
  })

  it('rejects native bash without emitting a DSH tool-call', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, bashExec())
      await waitUntil(() => capture.messages.some(message => (
        message.message.case === 'execClientMessage'
        && message.message.value.message.case === 'shellResult'
      )))
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const chunks = await collect(adapter(fake.origin).stream(request({ sessionId: 's1' as never })))
    expect(chunks.some(chunk => chunk.type === 'tool-call-delta')).toBe(false)
    expect(fake.captures[0]!.messages.some(message => (
      message.message.case === 'execClientMessage'
      && message.message.value.message.case === 'shellResult'
    ))).toBe(true)
  })

  it('does not emit a DSH tool-call for an MCP approval probe', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, mcpProbe('get_weather'))
      await waitUntil(() => capture.messages.some(message => (
        message.message.case === 'execClientMessage'
        && message.message.value.message.case === 'mcpResult'
      )))
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const chunks = await collect(adapter(fake.origin).stream(request({
      sessionId: 's1' as never,
      tools: [weather],
    })))
    expect(chunks.some(chunk => chunk.type === 'tool-call-delta')).toBe(false)
    expect(fake.captures[0]!.messages.some(message => (
      message.message.case === 'execClientMessage'
      && message.message.value.message.case === 'mcpResult'
    ))).toBe(true)
  })

  it('classifies Connect invalid_argument as INVALID_REQUEST', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.end(connectError('invalid_argument', 'invalid request'))
    })

    await expect(collect(adapter(fake.origin).stream(request()))).rejects.toMatchObject({ code: 'INVALID_REQUEST' })
  })

  it('classifies Connect canceled as ABORTED', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.end(connectError('canceled', 'operation canceled'))
    })

    await expect(collect(adapter(fake.origin).stream(request()))).rejects.toMatchObject({ code: 'ABORTED' })
  })

  it('classifies Connect permission_denied as AUTH', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.end(connectError('permission_denied', 'access denied'))
    })

    await expect(collect(adapter(fake.origin).stream(request()))).rejects.toMatchObject({
      code: 'AUTH',
      failure: { status: 403 },
    })
  })

  it('classifies Connect unauthenticated as AUTH', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.end(connectError('unauthenticated', 'credentials expired'))
    })

    await expect(collect(adapter(fake.origin).stream(request()))).rejects.toMatchObject({
      code: 'AUTH',
      failure: { status: 401 },
    })
  })

  it('classifies gRPC deadline status 4 as TIMEOUT', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.respond({ ':status': 200, 'content-type': 'application/connect+proto' }, { waitForTrailers: true })
      stream.on('wantTrailers', () => {
        stream.sendTrailers({ 'grpc-status': '4', 'grpc-message': 'deadline expired' })
      })
      stream.end()
    })

    await expect(collect(adapter(fake.origin).stream(request()))).rejects.toMatchObject({ code: 'TIMEOUT' })
  })

  it('classifies Connect deadline_exceeded as TIMEOUT', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.end(connectError('deadline_exceeded', 'deadline expired'))
    })

    await expect(collect(adapter(fake.origin).stream(request()))).rejects.toMatchObject({ code: 'TIMEOUT' })
  })

  it('keeps Connect unavailable retryable as SERVER', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.end(connectError('unavailable', 'service unavailable'))
    })

    await expect(collect(adapter(fake.origin).stream(request()))).rejects.toMatchObject({ code: 'SERVER' })
  })

  it('rotates conversationId after resource_exhausted with zero tokens', async () => {
    const first = conversationBinding('rot').conversationId
    const fake = await fakeRunServer(async (stream) => {
      stream.end(connectExhausted())
    })
    await expect(collect(adapter(fake.origin).stream(request({ sessionId: 'rot' as never })))).rejects.toMatchObject({ code: 'SERVER' })
    expect(conversationBinding('rot').conversationId).not.toBe(first)
    rotateConversationId('rot')
  })

  it('maps chat thinking level onto the Cursor wire id', async () => {
    const catalog = groupCursorModels([
      { id: 'gpt-5.2', name: 'GPT-5.2', thinking: false, vision: true },
      { id: 'gpt-5.2-low', name: 'GPT-5.2 Low', thinking: true, vision: true },
      { id: 'gpt-5.2-high', name: 'GPT-5.2 High', thinking: true, vision: true, maxMode: true },
    ])
    const cursor = new CursorAdapter({
      options: () => connection({ models: catalog }),
      resolveApiKey: () => Promise.resolve('test-access'),
    })
    const resolved = await cursor.resolveModel('cursor', 'gpt-5.2')
    expect(resolved.reasoning?.efforts.map(effort => String(effort.id))).toEqual(['low', 'medium', 'high'])
    expect(String(resolved.reasoning?.defaultEffort)).toBe('high')

    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      expect(capture.runRequest?.requestedModel?.modelId).toBe('gpt-5.2-high')
      expect(capture.runRequest?.modelDetails?.modelId).toBe('gpt-5.2-high')
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const running = new CursorAdapter({
      options: () => connection({ apiURL: fake.origin, models: catalog }),
      resolveApiKey: () => Promise.resolve('test-access'),
    })
    await collect(running.stream(request({
      model: 'gpt-5.2',
      reasoningEffort: ReasoningEffortId('high'),
    })))
  })

  it('rejects unknown models as INVALID_REQUEST', async () => {
    const cursor = adapter('http://127.0.0.1:1')
    await expect(cursor.resolveModel('cursor', 'not-a-model')).rejects.toMatchObject({ code: 'INVALID_REQUEST' })
    await expect(collect(cursor.stream(request({ model: 'not-a-model' })))).rejects.toMatchObject({
      code: 'INVALID_REQUEST',
    })
  })

  it('lists an empty catalog without reseeding Composer', async () => {
    const cursor = new CursorAdapter({
      options: () => connection({ models: [] }),
      resolveApiKey: () => Promise.resolve('test-access'),
    })
    await expect(cursor.listModels('cursor')).resolves.toEqual([])
    await expect(cursor.resolveModel('cursor', 'composer-2.5')).rejects.toMatchObject({ code: 'INVALID_REQUEST' })
  })

  it('keeps two parallel MCP calls from mixing arguments and parks both', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, mcpInvoke('get_weather', 'mcp-a', 3))
      sendServer(stream, mcpInvoke('lookup', 'mcp-b', 4))
      sendServer(stream, mcpStarted('env-a', 'get_weather', 'mcp-a'))
      sendServer(stream, mcpStarted('env-b', 'lookup', 'mcp-b'))
      sendServer(stream, mcpPartial('env-a', '{"city":"Paris"}', 'get_weather', 'mcp-a'))
      sendServer(stream, mcpPartial('env-b', '{"q":"x"}', 'lookup', 'mcp-b'))
      sendServer(stream, mcpCompleted('env-a', 'get_weather', 'mcp-a'))
      sendServer(stream, mcpCompleted('env-b', 'lookup', 'mcp-b'))
      await waitUntil(() => getParkedRun('s1') !== undefined)
    })
    const chunks = await collect(adapter(fake.origin).stream(request({
      sessionId: 's1' as never,
      tools: [weather, { name: 'lookup', description: 'Search', parameters: { type: 'object' } }],
    })))
    const deltas = chunks.filter(chunk => chunk.type === 'tool-call-delta')
    expect(deltas.some(chunk => chunk.id === 'env-a' && chunk.argumentsDelta.includes('Paris'))).toBe(true)
    expect(deltas.some(chunk => chunk.id === 'env-b' && chunk.argumentsDelta.includes('q'))).toBe(true)
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'tool-calls' } })
    expect(getParkedRun('s1')?.calls).toHaveLength(2)
    clearPark('s1')
  })

  it('does not emit a DSH tool-call for todo or connect_scm', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, serverOwnedTool('todo-1', 'todo'))
      sendServer(stream, serverOwnedTool('scm-1', 'scm'))
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const chunks = await collect(adapter(fake.origin).stream(request({ sessionId: 's1' as never })))
    expect(chunks.some(chunk => chunk.type === 'tool-call-delta')).toBe(false)
  })

  it('answers listMcpResources with an empty success and no DSH tool-call', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, listMcpResources())
      await waitUntil(() => capture.messages.some(message => (
        message.message.case === 'execClientMessage'
        && message.message.value.message.case === 'listMcpResourcesExecResult'
      )))
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const chunks = await collect(adapter(fake.origin).stream(request({ sessionId: 's1' as never })))
    expect(chunks.some(chunk => chunk.type === 'tool-call-delta')).toBe(false)
  })

  it('classifies an idle provider stream as TIMEOUT', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.respond({ ':status': 200, 'content-type': 'application/connect+proto' })
    })

    await expect(collect(adapter(fake.origin, undefined, {
      streamIdleTimeoutMs: 10,
    }).stream(request()))).rejects.toMatchObject({ code: 'TIMEOUT' })
  })

  it('classifies an HTTP/2 stream error as TRANSPORT', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.on('error', () => { /* expected reset */ })
      stream.destroy(new Error('socket reset'))
    })

    await expect(collect(adapter(fake.origin).stream(request()))).rejects.toMatchObject({ code: 'TRANSPORT' })
  })

  it('fails when the HTTP/2 stream ends before turnEnded', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, textDelta('partial'))
      stream.end()
    })
    await expect(collect(adapter(fake.origin).stream(request({ sessionId: 's1' as never })))).rejects.toMatchObject({
      code: 'TRANSPORT',
      message: expect.stringMatching(/turnEnded/u),
    })
  })

  it('clears a parked Run when the caller aborts', async () => {
    const ac = new AbortController()
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, textDelta('x'))
    })
    const pending = collect(adapter(fake.origin).stream(request({
      sessionId: 's1' as never,
      signal: ac.signal,
    })))
    await waitUntil(() => fake.captures[0]?.runRequest !== undefined)
    ac.abort()
    await expect(pending).rejects.toMatchObject({ code: 'ABORTED' })
    expect(getParkedRun('s1')).toBeUndefined()
  })

  it('puts the first assistant turn into the next Run rootPrompt', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    await collect(adapter(fake.origin).stream(request({
      sessionId: 's1' as never,
      messages: [userText('one'), assistantText('hello from round one'), userText('two')],
    })))
    const prompt = fake.captures[0]!.runRequest?.conversationState?.rootPromptMessagesJson ?? []
    expect(prompt.length).toBeGreaterThan(1)
  })

  it('classifies HTTP 400 as INVALID_REQUEST', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.respond({ ':status': 400 })
      stream.end()
    })

    await expect(collect(adapter(fake.origin).stream(request()))).rejects.toMatchObject({
      code: 'INVALID_REQUEST',
      failure: { status: 400 },
    })
  })

  it('classifies HTTP 503 as SERVER', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.respond({ ':status': 503 })
      stream.end()
    })

    await expect(collect(adapter(fake.origin).stream(request()))).rejects.toMatchObject({
      code: 'SERVER',
      failure: { status: 503 },
    })
  })

  it('classifies HTTP 429 as RATE_LIMIT', async () => {
    const fake = await fakeRunServer((stream) => {
      stream.respond({ ':status': 429 })
      stream.end()
    })

    await expect(collect(adapter(fake.origin).stream(request()))).rejects.toMatchObject({
      code: 'RATE_LIMIT',
      failure: { status: 429 },
    })
  })

  it('refreshes once and retries the Run after HTTP 401', async () => {
    let hits = 0
    const fake = await fakeRunServer(async (stream, capture) => {
      hits += 1
      await waitUntil(() => capture.runRequest !== undefined)
      if (hits === 1) {
        stream.respond({ ':status': 401 })
        stream.end()
        return
      }
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const cursor = new CursorAdapter({
      options: () => connection({ apiURL: fake.origin }),
      resolveApiKey: () => Promise.resolve('stale'),
      refreshApiKey: () => Promise.resolve('fresh'),
    })
    const chunks = await collect(cursor.stream(request({ sessionId: 's1' as never })))
    expect(chunks.some(chunk => chunk.type === 'text-delta' && chunk.text === 'ok')).toBe(true)
    expect(fake.captures).toHaveLength(2)
    expect(fake.captures[1]?.headers.authorization).toBe('Bearer fresh')
  })

  it('sends image bytes on the active user message', async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    const ref = pngRef()
    const store = {
      readImage: async () => ({ ref, data: png }),
    } as Pick<AttachmentStore, 'readImage'> as AttachmentStore
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      const action = capture.runRequest?.action
      const images = action?.action.case === 'userMessageAction'
        ? action.action.value.userMessage?.selectedContext?.selectedImages ?? []
        : []
      expect(images).toHaveLength(1)
      expect(images[0]?.dataOrBlobId.case).toBe('blobIdWithData')
      sendServer(stream, textDelta('saw it'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const cursor = new CursorAdapter({
      options: () => connection({ apiURL: fake.origin }),
      resolveApiKey: () => Promise.resolve('test-access'),
      resolveAttachments: () => store,
    })
    const chunks = await collect(cursor.stream(request({
      messages: [userImage('see', ref)],
    })))
    expect(chunks.some(chunk => chunk.type === 'text-delta' && chunk.text === 'saw it')).toBe(true)
  })

  it('opens a new Run with resumeAction when park does not match', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, textDelta('x'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const chunks = await collect(adapter(fake.origin).stream(request({
      sessionId: 's1' as never,
      messages: [userText('ask'), assistantToolCall('c1', 'get_weather', '{}'), toolResult('c1', '')],
    })))
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'stop' } })
    expect(fake.captures[0]!.runRequest?.action?.action.case).toBe('resumeAction')
  })
})
