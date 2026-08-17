import { afterEach, describe, expect, it } from 'vitest'
import { LlmError, resolveRetryPolicy } from '@deepseek-ai/dsh-llm'
import { CursorAdapter } from '../src/adapter.ts'
import type { CursorConnectionOptions } from '../src/adapter.ts'
import { CURSOR_CATALOG, CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS } from '../src/client-contract.ts'
import { CURSOR_CLIENT_VERSION } from '../src/identity.ts'
import { conversationBinding, rotateConversationId } from '../src/run.ts'
import { clearPark } from '../src/park.ts'
import {
  bashExec,
  closeFakeRunServers,
  connectExhausted,
  fakeRunServer,
  getBlob,
  mcpCompleted,
  mcpInvoke,
  mcpPartial,
  mcpProbe,
  mcpStarted,
  requestContext,
  sendServer,
  textDelta,
  thinkingDelta,
  tokenDelta,
  turnEnded,
} from './fake-run-server.ts'
import { assistantToolCall, collect, request, toolResult, userText } from './helpers.ts'

afterEach(async () => {
  clearPark('s1')
  clearPark(undefined)
  await closeFakeRunServers()
})

const POLICY = resolveRetryPolicy(undefined, 'test')

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

function adapter(apiURL: string, resolveApiKey: () => Promise<string> = () => Promise.resolve('test-access')) {
  return new CursorAdapter({
    options: () => connection({ apiURL }),
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
    })))
    expect(chunks.some(chunk => chunk.type === 'reasoning-delta' && chunk.text === 'hmm')).toBe(true)
    expect(chunks.some(chunk => chunk.type === 'text-delta' && chunk.text === 'hello')).toBe(true)
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'stop' } })
    expect(fake.captures[0]!.messages.some(message => message.message.case === 'clientHeartbeat')).toBe(true)
    expect(fake.captures[0]!.messages.some(message => message.message.case === 'kvClientMessage')).toBe(true)
    expect(fake.captures[0]!.messages.some(message => message.message.case === 'execClientMessage')).toBe(true)
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

  it('rotates conversationId after resource_exhausted with zero tokens', async () => {
    const first = conversationBinding('rot').conversationId
    const fake = await fakeRunServer(async (stream) => {
      stream.end(connectExhausted())
    })
    await expect(collect(adapter(fake.origin).stream(request({ sessionId: 'rot' as never })))).rejects.toThrow()
    expect(conversationBinding('rot').conversationId).not.toBe(first)
    rotateConversationId('rot')
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
      messages: [userText('ask'), toolResult('missing', '')],
    })))
    expect(chunks.at(-1)).toMatchObject({ type: 'finish', reason: { kind: 'stop' } })
    expect(fake.captures[0]!.runRequest?.action?.action.case).toBe('resumeAction')
  })
})
