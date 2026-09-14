import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ServerHttp2Stream } from 'node:http2'
import { LlmError, ReasoningEffortId, resolveRetryPolicy } from '@deepseek-ai/dsh-llm'
import type { AttachmentStore } from '@deepseek-ai/dsh-attachment'
import { CursorAdapter } from '../src/adapter.ts'
import { resolveAdapterOptions } from '../src/index.ts'
import type { CursorConnectionOptions } from '../src/adapter.ts'
import { groupCursorModels } from '../src/catalog.ts'
import { CURSOR_CATALOG, CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS, CURSOR_MCP_PROVIDER_ID } from '../src/client-contract.ts'
import { CURSOR_CLIENT_VERSION } from '../src/identity.ts'
import { DEFAULT_RUN_LIFECYCLE } from '../src/run-registry.ts'
import {
  bashExec,
  checkpoint,
  closeFakeRunServers,
  connectError,
  connectExhausted,
  fakeRunServer,
  getBlob,
  listMcpResources,
  mcpCompleted,
  mcpAllowlistPrecheck,
  mcpInvoke,
  mcpPartial,
  mcpPlaceholder,
  mcpProbe,
  mcpStarted,
  requestContext,
  sendServer,
  serverOwnedTool,
  shellAllowlistPrecheck,
  shellStreamExec,
  textDelta,
  thinkingDelta,
  tokenDelta,
  turnEnded,
  webFetchAllowlistPrecheck,
} from './fake-run-server.ts'
import { assistantText, assistantToolCall, collect, pngRef, request, toolResult, userImage, userText } from './helpers.ts'

const cursors: CursorAdapter[] = []

afterEach(async () => {
  for (const cursor of cursors.splice(0)) cursor.registry.dispose()
  await closeFakeRunServers()
})

const POLICY = resolveRetryPolicy({ mode: 'normal', maxRetries: 8 }, 'test')

function connection(overrides: Partial<CursorConnectionOptions> = {}): CursorConnectionOptions {
  return {
    apiURL: 'http://127.0.0.1',
    models: CURSOR_CATALOG,
    streamIdleTimeoutMs: CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS,
    runLifecycle: {
      ...DEFAULT_RUN_LIFECYCLE,
      heartbeatIntervalMs: 30,
      heartbeatJitterRatio: 0,
    },
    retryPolicy: POLICY,
    ...overrides,
  }
}

function adapter(
  apiURL: string,
  resolveApiKey: () => Promise<string> = () => Promise.resolve('test-access'),
  overrides: Partial<CursorConnectionOptions> = {},
) {
  const cursor = new CursorAdapter({
    options: () => connection({ apiURL, ...overrides }),
    resolveApiKey,
  })
  cursors.push(cursor)
  return cursor
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
  it('rejects duplicate catalog ids', () => {
    expect(() => resolveAdapterOptions({
      models: [{ id: 'composer-2' }, { id: 'composer-2' }],
    })).toThrow(/duplicate catalog model "composer-2"/)
  })

  it('resolves the host default and an explicit eight-retry policy', () => {
    expect(resolveAdapterOptions({}).retryPolicy).toMatchObject({ mode: 'normal', maxRetries: 2 })
    expect(resolveAdapterOptions({
      retryPolicy: { mode: 'normal', maxRetries: 8 },
    }).retryPolicy).toMatchObject({
      mode: 'normal',
      maxRetries: 8,
      retryableCodes: expect.arrayContaining(['AUTH']),
    })
    expect(resolveAdapterOptions({}).runLifecycle).toEqual(DEFAULT_RUN_LIFECYCLE)
  })

  it('declares neutral request-image pricing', () => {
    expect(Object.hasOwn(CursorAdapter.prototype, 'imageRequestPricing')).toBe(true)
    const adapter = new CursorAdapter({
      options: () => connection(),
      resolveApiKey: () => Promise.resolve('test-access'),
    })
    cursors.push(adapter)
    expect(adapter.imageRequestPricing('cursor', 'any-model')).toBeUndefined()
  })

  it.each([
    [{ runLifecycle: { parkedRunTtlMs: Number.POSITIVE_INFINITY } }, 'parkedRunTtlMs'],
    [{ runLifecycle: { bindingIdleTtlMs: 0 } }, 'bindingIdleTtlMs'],
    [{ runLifecycle: { maxOpenRuns: 1.5 } }, 'maxOpenRuns'],
    [{ runLifecycle: { maxOpenRuns: 2, maxBindings: 1 } }, 'maxBindings'],
    [{ runLifecycle: { heartbeatJitterRatio: 0.51 } }, 'heartbeatJitterRatio'],
    [{ runLifecycle: { heartbeatIntervalMs: 100, heartbeatJitterRatio: 0.5, parkedRunTtlMs: 150 } }, 'parkedRunTtlMs'],
  ] as const)('rejects invalid lifecycle configuration %#', (config, field) => {
    expect(() => resolveAdapterOptions(config)).toThrow(expect.objectContaining({
      message: expect.stringContaining(field),
    }))
  })

  it('exposes an eight-retry provider policy', () => {
    expect(adapter('http://127.0.0.1').providerRetryPolicy('cursor')).toMatchObject({
      mode: 'normal',
      maxRetries: 8,
    })
  })

  it('owns prepareCall so the Alpha.4 Host can dispatch without LlmAdapter.prototype', async () => {
    const cursor = adapter('http://127.0.0.1')
    expect(Object.hasOwn(Object.getPrototypeOf(cursor), 'prepareCall')).toBe(true)
    const prepared = await cursor.prepareCall('cursor', 'composer-2.5')
    expect(prepared.model.id).toBe('composer-2.5')
    expect(typeof prepared.stream).toBe('function')
  })

  it('does not let an old prepared request roll the shared registry back to stale lifecycle settings', async () => {
    const oldLifecycle = { ...DEFAULT_RUN_LIFECYCLE, maxOpenRuns: 64 }
    const newLifecycle = { ...DEFAULT_RUN_LIFECYCLE, maxOpenRuns: 1 }
    let current = connection({ runLifecycle: oldLifecycle })
    const cursor = new CursorAdapter({
      options: () => current,
      resolveApiKey: () => Promise.resolve('test-access'),
    })
    cursors.push(cursor)
    const prepared = await cursor.prepareCall('cursor', 'composer-2.5')
    current = connection({ runLifecycle: newLifecycle })
    cursor.registry.reconfigure(newLifecycle)
    cursor.registry.openRun('held', () => ({
      value: {} as never,
      close: () => {},
      heartbeat: () => {},
      isClosed: () => false,
    }))

    await expect(collect(prepared.stream(request()))).rejects.toMatchObject({ code: 'LOCAL_CAPACITY' })
    expect(cursor.registry.snapshot()).toMatchObject({ openRuns: 1, activeRuns: 1 })
  })

  it('does not let an old prepared request restore a stale parked-Run TTL', async () => {
    const fake = await fakeRunServer(async (_stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
    })
    const oldLifecycle = DEFAULT_RUN_LIFECYCLE
    const newLifecycle = {
      ...DEFAULT_RUN_LIFECYCLE,
      heartbeatIntervalMs: 10,
      heartbeatJitterRatio: 0,
      parkedRunTtlMs: 30,
    }
    let current = connection({ apiURL: fake.origin, runLifecycle: oldLifecycle })
    const cursor = new CursorAdapter({
      options: () => current,
      resolveApiKey: () => Promise.resolve('test-access'),
    })
    cursors.push(cursor)
    const prepared = await cursor.prepareCall('cursor', 'composer-2.5')
    const close = vi.fn()
    const parked = cursor.registry.openRun('parked', () => ({
      value: {} as never,
      close,
      heartbeat: () => {},
      isClosed: () => false,
    }))
    cursor.registry.park(parked)
    current = connection({ apiURL: fake.origin, runLifecycle: newLifecycle })
    cursor.registry.reconfigure(newLifecycle)
    const controller = new AbortController()

    const pending = collect(prepared.stream(request({ signal: controller.signal })))
    await waitUntil(() => close.mock.calls.length === 1)
    controller.abort()

    await expect(pending).rejects.toMatchObject({ code: 'ABORTED' })
    expect(close).toHaveBeenCalledOnce()
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

  it('contains a throwing diagnostic callback without changing the streamed result', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const cursor = new CursorAdapter({
      options: () => connection({ apiURL: fake.origin }),
      resolveApiKey: () => Promise.resolve('test-access'),
      debug: () => { throw new Error('diagnostic failed') },
    })
    cursors.push(cursor)

    const chunks = await collect(cursor.stream(request({ stop: ['ignored'] })))

    expect(chunks.some(chunk => chunk.type === 'text-delta' && chunk.text === 'ok')).toBe(true)
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'stop' } })
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

  it('finishes an MCP tool call when exec starts before toolCallCompleted', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, mcpPlaceholder('env-skill', 'mcp-skill'))
      sendServer(stream, mcpStarted('env-skill', 'skill', 'mcp-skill', { name: 'ponytail' }))
      sendServer(stream, mcpInvoke('skill', 'mcp-skill', 3, { name: 'ponytail' }))
    })
    const chunks = await collect(adapter(fake.origin, undefined, { streamIdleTimeoutMs: 100 }).stream(request({
      sessionId: 's1' as never,
      tools: [{
        name: 'skill',
        description: 'Load a skill',
        parameters: { type: 'object', properties: { name: { type: 'string' } } },
      }],
    })))
    const completed = chunks.find(chunk => (
      chunk.type === 'block-end' && chunk.block.type === 'tool-call'
    ))
    expect(completed).toMatchObject({
      block: { type: 'tool-call', name: 'skill', arguments: '{"name":"ponytail"}' },
    })
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'tool-calls' } })
  })

  it('ignores a late completion for the resumed MCP call before the next invocation', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, mcpPlaceholder('env-skill', 'mcp-skill'))
      sendServer(stream, mcpStarted('env-skill', 'skill', 'mcp-skill', { name: 'ponytail' }))
      sendServer(stream, mcpInvoke('skill', 'mcp-skill', 3, { name: 'ponytail' }))
      await waitUntil(() => capture.messages.some(message => (
        message.message.case === 'execClientMessage'
        && message.message.value.message.case === 'mcpResult'
      )))
      sendServer(stream, mcpCompleted('env-skill', 'skill', 'mcp-skill'))
      sendServer(stream, mcpPlaceholder('env-glob', 'mcp-glob'))
      sendServer(stream, mcpStarted('env-glob', 'glob', 'mcp-glob', { pattern: '*.py' }))
      sendServer(stream, mcpInvoke('glob', 'mcp-glob', 4, { pattern: '*.py' }))
    })
    const cursor = adapter(fake.origin, undefined, { streamIdleTimeoutMs: 500 })
    const tools = [
      {
        name: 'skill',
        description: 'Load a skill',
        parameters: { type: 'object', properties: { name: { type: 'string' } } },
      },
      {
        name: 'glob',
        description: 'Find files',
        parameters: { type: 'object', properties: { pattern: { type: 'string' } } },
      },
    ]
    await collect(cursor.stream(request({ sessionId: 's1' as never, tools })))
    const second = await collect(cursor.stream(request({
      sessionId: 's1' as never,
      tools,
      messages: [
        userText('write code'),
        assistantToolCall('env-skill', 'skill', '{"name":"ponytail"}'),
        toolResult('env-skill', 'loaded'),
      ],
    })))
    const calls = second.flatMap(chunk => (
      chunk.type === 'block-end' && chunk.block.type === 'tool-call' ? [chunk.block.name] : []
    ))
    expect(calls).toEqual(['glob'])
    expect(second.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'tool-calls' } })
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

  it('rejects streamed native shell with the matching response type', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, shellStreamExec())
      await waitUntil(() => capture.messages.some(message => (
        message.message.case === 'execClientMessage'
        && message.message.value.message.case === 'shellStream'
        && message.message.value.message.value.event.case === 'rejected'
      )))
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const chunks = await collect(adapter(fake.origin).stream(request({ sessionId: 's1' as never })))
    expect(chunks.some(chunk => chunk.type === 'tool-call-delta')).toBe(false)
    expect(chunks.some(chunk => chunk.type === 'text-delta' && chunk.text === 'ok')).toBe(true)
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

  it('answers modern allowlist prechecks so Cursor can continue', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, mcpAllowlistPrecheck('get_weather'))
      sendServer(stream, shellAllowlistPrecheck())
      sendServer(stream, webFetchAllowlistPrecheck())
      await waitUntil(() => capture.messages.filter(message => (
        message.message.case === 'execClientMessage'
        && message.message.value.message.case.endsWith('AllowlistPrecheckResult')
      )).length === 3)
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const chunks = await collect(adapter(fake.origin).stream(request({
      sessionId: 's1' as never,
      tools: [weather],
    })))
    expect(chunks.some(chunk => chunk.type === 'tool-call-delta')).toBe(false)
    const responses = fake.captures[0]!.messages.flatMap((message) => {
      if (message.message.case !== 'execClientMessage') return []
      const result = message.message.value.message
      if (!result.case.endsWith('AllowlistPrecheckResult')) return []
      return [{ case: result.case, allowlisted: result.value.allowlisted }]
    })
    expect(responses).toEqual([
      { case: 'mcpAllowlistPrecheckResult', allowlisted: false },
      { case: 'shellAllowlistPrecheckResult', allowlisted: false },
      { case: 'webFetchAllowlistPrecheckResult', allowlisted: false },
    ])
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
    const fake = await fakeRunServer(async (stream) => {
      stream.end(connectExhausted())
    })
    const cursor = adapter(fake.origin)
    const first = cursor.registry.binding('rot').conversationId
    await expect(collect(cursor.stream(request({ sessionId: 'rot' as never })))).rejects.toMatchObject({ code: 'SERVER' })
    expect(cursor.registry.binding('rot').conversationId).not.toBe(first)
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

  it('resolves synthesized Fast and Max ids with Host-matching metadata', async () => {
    const cursor = new CursorAdapter({
      options: () => connection({
        models: [{
          id: 'composer-2.5',
          name: 'Composer 2.5',
          thinking: false,
          vision: true,
          contextWindow: 200_000,
        }],
      }),
      resolveApiKey: () => Promise.resolve('test-access'),
    })
    const listed = await cursor.listModels('cursor')
    expect(listed.map(model => model.id)).toContain('composer-2.5-fast')
    const resolved = await cursor.resolveModel('cursor', 'composer-2.5-fast')
    expect(resolved.provider).toBe('cursor')
    expect(resolved.id).toBe('composer-2.5-fast')
    expect(resolved.name.length).toBeGreaterThan(0)
    expect(resolved.context?.contextWindow).toBe(200_000)
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
      await waitUntil(() => cursor.registry.snapshot().parkedRuns === 1)
    })
    const cursor = adapter(fake.origin)
    const chunks = await collect(cursor.stream(request({
      sessionId: 's1' as never,
      tools: [weather, { name: 'lookup', description: 'Search', parameters: { type: 'object' } }],
    })))
    const deltas = chunks.filter(chunk => chunk.type === 'tool-call-delta')
    expect(deltas.some(chunk => chunk.id === 'env-a' && chunk.argumentsDelta.includes('Paris'))).toBe(true)
    expect(deltas.some(chunk => chunk.id === 'env-b' && chunk.argumentsDelta.includes('q'))).toBe(true)
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'tool-calls' } })
    expect(cursor.registry.snapshot().parkedRuns).toBe(1)
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
    const cursor = adapter(fake.origin)
    const pending = collect(cursor.stream(request({
      sessionId: 's1' as never,
      signal: ac.signal,
    })))
    await waitUntil(() => fake.captures[0]?.runRequest !== undefined)
    ac.abort()
    await expect(pending).rejects.toMatchObject({ code: 'ABORTED' })
    expect(cursor.registry.snapshot().openRuns).toBe(0)
  })

  it('aborts only its exact Run when the same adapter has another Run in the same session', async () => {
    const streams: ServerHttp2Stream[] = []
    const fake = await fakeRunServer(async (stream, capture) => {
      streams.push(stream)
      await waitUntil(() => capture.runRequest !== undefined)
    })
    const cursor = adapter(fake.origin)
    const abortedController = new AbortController()
    const aborted = collect(cursor.stream(request({
      sessionId: 'shared-session' as never,
      signal: abortedController.signal,
    })))
    await waitUntil(() => fake.captures[0]?.runRequest !== undefined)
    const survivor = collect(cursor.stream(request({ sessionId: 'shared-session' as never })))
    await waitUntil(() => fake.captures[1]?.runRequest !== undefined)
    await waitUntil(() => fake.captures[1]?.messages.some(message => message.message.case === 'clientHeartbeat') === true)
    const survivorHeartbeats = fake.captures[1]!.messages.filter(
      message => message.message.case === 'clientHeartbeat',
    ).length

    abortedController.abort()

    await expect(aborted).rejects.toMatchObject({ code: 'ABORTED' })
    await waitUntil(() => streams[0]?.closed === true)
    expect(streams[1]?.closed).toBe(false)
    expect(cursor.registry.snapshot()).toMatchObject({ openRuns: 1, activeRuns: 1 })
    await waitUntil(() => fake.captures[1]!.messages.filter(
      message => message.message.case === 'clientHeartbeat',
    ).length > survivorHeartbeats)

    sendServer(streams[1]!, textDelta('survived'))
    sendServer(streams[1]!, turnEnded())
    streams[1]!.end()
    const chunks = await survivor

    expect(chunks.some(chunk => chunk.type === 'text-delta' && chunk.text === 'survived')).toBe(true)
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'stop' } })
    expect(cursor.registry.snapshot().openRuns).toBe(0)
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

  it('sends image bytes when a later same-turn user message is text-only', async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    const ref = pngRef()
    const store = {
      readImage: async () => ({ ref, data: png }),
    } as Pick<AttachmentStore, 'readImage'> as AttachmentStore
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      const action = capture.runRequest?.action
      expect(action?.action.case).toBe('userMessageAction')
      const userMessage = action?.action.case === 'userMessageAction' ? action.action.value.userMessage : undefined
      expect(userMessage?.text).toContain('see')
      expect(userMessage?.text).toContain('same-turn follow-up')
      const images = userMessage?.selectedContext?.selectedImages ?? []
      expect(images).toHaveLength(1)
      expect(images[0]?.dataOrBlobId.case).toBe('blobIdWithData')
      expect(capture.runRequest?.conversationState?.turns).toHaveLength(0)
      expect(userMessage?.selectedContext?.selectedImages).toHaveLength(1)
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
      messages: [userImage('see', ref), userText('same-turn follow-up')],
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

  it('applies provider idle timeout after writing a resumed mcpResult', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, mcpInvoke('get_weather', 'mcp-timeout'))
      sendServer(stream, mcpStarted('env-timeout', 'get_weather', 'mcp-timeout'))
      sendServer(stream, mcpPartial('env-timeout', '{}', 'get_weather', 'mcp-timeout'))
      sendServer(stream, mcpCompleted('env-timeout', 'get_weather', 'mcp-timeout'))
    })
    const cursor = adapter(fake.origin, () => Promise.resolve('test-access'), { streamIdleTimeoutMs: 40 })
    await collect(cursor.stream(request({ sessionId: 's1' as never, tools: [weather] })))

    await expect(collect(cursor.stream(request({
      sessionId: 's1' as never,
      tools: [weather],
      messages: [
        userText('hi'),
        assistantToolCall('env-timeout', 'get_weather', '{}'),
        toolResult('env-timeout', 'sunny'),
      ],
    })))).rejects.toMatchObject({ code: 'TIMEOUT' })
  }, 1_000)

  it('lets one adapter abort its exact Run without closing another adapter park for the same session', async () => {
    const parkedServer = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, mcpInvoke('get_weather', 'mcp-isolated'))
      sendServer(stream, mcpStarted('env-isolated', 'get_weather', 'mcp-isolated'))
      sendServer(stream, mcpPartial('env-isolated', '{}', 'get_weather', 'mcp-isolated'))
      sendServer(stream, mcpCompleted('env-isolated', 'get_weather', 'mcp-isolated'))
    })
    const parkedAdapter = adapter(parkedServer.origin)
    await collect(parkedAdapter.stream(request({ sessionId: 's1' as never, tools: [weather] })))

    const activeServer = await fakeRunServer(async (_stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
    })
    const activeAdapter = adapter(activeServer.origin)
    const controller = new AbortController()
    const pending = collect(activeAdapter.stream(request({ sessionId: 's1' as never, signal: controller.signal })))
    await waitUntil(() => activeServer.captures[0]?.runRequest !== undefined)
    controller.abort()

    await expect(pending).rejects.toMatchObject({ code: 'ABORTED' })
    expect(activeAdapter.registry.snapshot().openRuns).toBe(0)
    expect(parkedAdapter.registry.snapshot().parkedRuns).toBe(1)
  })

  it('opens a full-history resume Run after the parked Run TTL expires while retaining the binding', async () => {
    let requestNumber = 0
    const fake = await fakeRunServer(async (stream, capture) => {
      requestNumber += 1
      await waitUntil(() => capture.runRequest !== undefined)
      if (requestNumber === 1) {
        sendServer(stream, mcpInvoke('get_weather', 'mcp-expire'))
        sendServer(stream, mcpStarted('env-expire', 'get_weather', 'mcp-expire'))
        sendServer(stream, mcpPartial('env-expire', '{}', 'get_weather', 'mcp-expire'))
        sendServer(stream, mcpCompleted('env-expire', 'get_weather', 'mcp-expire'))
        return
      }
      sendServer(stream, textDelta('resumed from history'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const cursor = adapter(fake.origin, () => Promise.resolve('test-access'), {
      runLifecycle: {
        ...DEFAULT_RUN_LIFECYCLE,
        heartbeatIntervalMs: 10,
        heartbeatJitterRatio: 0,
        parkedRunTtlMs: 30,
      },
    })
    await collect(cursor.stream(request({ sessionId: 's1' as never, tools: [weather] })))
    const conversationId = cursor.registry.binding('s1').conversationId
    await waitUntil(() => cursor.registry.snapshot().openRuns === 0)

    const chunks = await collect(cursor.stream(request({
      sessionId: 's1' as never,
      tools: [weather],
      messages: [
        userText('hi'),
        assistantToolCall('env-expire', 'get_weather', '{}'),
        toolResult('env-expire', 'sunny'),
      ],
    })))

    expect(chunks.some(chunk => chunk.type === 'text-delta' && chunk.text === 'resumed from history')).toBe(true)
    expect(fake.captures).toHaveLength(2)
    expect(fake.captures[1]?.runRequest?.action?.action.case).toBe('resumeAction')
    expect(fake.captures[1]?.runRequest?.conversationId).toBe(conversationId)
  })

  it('omits usage when the protocol reports no token facts and keeps it when tokens are known', async () => {
    const noTokenFake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, textDelta('hello'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const noTokenChunks = await collect(adapter(noTokenFake.origin).stream(request({ sessionId: 'no-token' as never })))
    expect(noTokenChunks.some(chunk => chunk.type === 'usage')).toBe(false)
    expect(noTokenChunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'stop' } })

    const tokenDeltaFake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, textDelta('hello'))
      sendServer(stream, tokenDelta(7))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const tokenChunks = await collect(adapter(tokenDeltaFake.origin).stream(request({ sessionId: 'with-token' as never })))
    expect(tokenChunks.some(chunk => chunk.type === 'usage')).toBe(true)
    expect(tokenChunks.find(chunk => chunk.type === 'usage')).toMatchObject({ usage: { inputTokens: 0, outputTokens: 7 } })
    expect(tokenChunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'stop' } })

    const checkpointFake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, checkpoint(123))
      sendServer(stream, textDelta('hi'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const checkpointChunks = await collect(adapter(checkpointFake.origin).stream(request({ sessionId: 'checkpoint-token' as never })))
    expect(checkpointChunks.some(chunk => chunk.type === 'usage')).toBe(true)
    expect(checkpointChunks.find(chunk => chunk.type === 'usage')).toMatchObject({ usage: { inputTokens: 123, outputTokens: 0 } })
  })
})
