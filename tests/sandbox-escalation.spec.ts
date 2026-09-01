import { afterEach, describe, expect, it } from 'vitest'
import { CursorAdapter } from '../src/adapter.ts'
import { narrowCursorEscalationSchemas } from '../src/adapter.ts'
import { CURSOR_CATALOG, CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS } from '../src/client-contract.ts'
import { DEFAULT_RUN_LIFECYCLE } from '../src/run-registry.ts'
import { resolveRetryPolicy } from '@deepseek-ai/dsh-llm'
import { closeFakeRunServers, fakeRunServer, requestContext, sendServer, textDelta, turnEnded } from './fake-run-server.ts'
import { collect, request, userText } from './helpers.ts'
import { fromBinary, toJson } from '@bufbuild/protobuf'
import { ValueSchema } from '@bufbuild/protobuf/wkt'

function baseOptions(mode: string) {
  return {
    provider: 'cursor',
    model: 'composer-2.5',
    messages: [] as never[],
    system: `Current DSH file policy: ${mode}.`,
    tools: [{
      name: 'write',
      description: 'write file',
      parameters: {
        type: 'object',
        properties: {
          file_path: { type: 'string' },
          sandbox_permissions: { type: 'string', enum: ['workspace-write', 'danger-full-access'] },
          justification: { type: 'string' },
        },
        required: ['file_path', 'sandbox_permissions', 'justification'],
      },
    }],
  }
}

describe('narrowCursorEscalationSchemas', () => {
  it('reads current mode from DSH context-injection message', () => {
    const req: any = baseOptions('unknown')
    req.system = 'You are a coding agent.'
    req.messages = [{
      role: 'user',
      content: [{ type: 'text', text: 'Current DSH file policy: workspace-write. Writes are confined.' }],
      source: { kind: 'user' },
    }]
    const narrowed = narrowCursorEscalationSchemas(req)
    expect((narrowed.tools?.[0]?.parameters as any).properties.sandbox_permissions.enum).toEqual(['danger-full-access'])
  })
  it('offers only strictly wider modes to workspace-write', () => {
    const original: any = baseOptions('workspace-write')
    const narrowed = narrowCursorEscalationSchemas(original)
    expect((narrowed.tools?.[0]?.parameters as any).properties.sandbox_permissions.enum).toEqual(['danger-full-access'])
    expect((narrowed.tools?.[0]?.parameters as any).properties.justification).toBeDefined()
    expect((original.tools[0]?.parameters as any).properties.sandbox_permissions.enum).toEqual(['workspace-write', 'danger-full-access'])
  })
  it('removes impossible escalation fields from danger-full-access', () => {
    const narrowed: any = narrowCursorEscalationSchemas(baseOptions('danger-full-access') as never)
    const parameters = narrowed.tools?.[0]?.parameters as any
    expect(parameters.properties.sandbox_permissions).toBeUndefined()
    expect(parameters.properties.justification).toBeUndefined()
    expect(parameters.required).toEqual(['file_path'])
  })
  it('keeps both wider modes available to read-only', () => {
    const narrowed: any = narrowCursorEscalationSchemas(baseOptions('read-only') as never)
    expect((narrowed.tools?.[0]?.parameters as any).properties.sandbox_permissions.enum).toEqual(['workspace-write', 'danger-full-access'])
  })
  it('does not mutate original options (immutability)', () => {
    const original: any = baseOptions('danger-full-access')
    const snapshot = JSON.stringify(original)
    const narrowed = narrowCursorEscalationSchemas(original)
    expect(JSON.stringify(original)).toBe(snapshot)
    expect(narrowed).not.toBe(original)
  })
  it('returns original reference when mode is unknown or tools missing', () => {
    const noTools: any = { provider: 'cursor', model: 'x', messages: [], system: 'Current DSH file policy: workspace-write.' }
    expect(narrowCursorEscalationSchemas(noTools)).toBe(noTools)
    const unknown: any = baseOptions('unknown-mode')
    unknown.system = 'no policy here'
    expect(narrowCursorEscalationSchemas(unknown)).toBe(unknown)
  })
  it('ignores tools without sandbox_permissions', () => {
    const opts: any = {
      provider: 'cursor', model: 'x', messages: [], system: 'Current DSH file policy: workspace-write.',
      tools: [{ name: 'get_weather', description: 'weather', parameters: { type: 'object', properties: { city: { type: 'string' } } } }]
    }
    const narrowed = narrowCursorEscalationSchemas(opts)
    expect(narrowed).toBe(opts)
  })
  it('prefers newest message over stale system (workspace-write system + danger-full-access message removes escalation)', () => {
    const opts: any = baseOptions('workspace-write')
    opts.system = 'Current DSH file policy: workspace-write.'
    opts.messages = [{
      role: 'user',
      content: [{ type: 'text', text: 'Current DSH file policy: danger-full-access.' }],
      source: { kind: 'user' },
    }]
    const narrowed: any = narrowCursorEscalationSchemas(opts)
    const params = narrowed.tools?.[0]?.parameters as any
    expect(params.properties.sandbox_permissions).toBeUndefined()
    expect(params.properties.justification).toBeUndefined()
    expect(params.required).toEqual(['file_path'])
    expect((opts.tools[0]?.parameters as any).properties.sandbox_permissions.enum).toEqual(['workspace-write', 'danger-full-access'])
  })
})

const POLICY = resolveRetryPolicy({ mode: 'normal', maxRetries: 8 }, 'test')
function conn(apiURL: string) {
  return {
    apiURL,
    models: CURSOR_CATALOG,
    streamIdleTimeoutMs: CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS,
    runLifecycle: { ...DEFAULT_RUN_LIFECYCLE, heartbeatIntervalMs: 30, heartbeatJitterRatio: 0 },
    retryPolicy: POLICY,
  }
}
const toolEsc = {
  name: 'custom_write',
  description: 'write',
  parameters: {
    type: 'object',
    properties: {
      file_path: { type: 'string' },
      sandbox_permissions: { type: 'string', enum: ['workspace-write', 'danger-full-access'] },
      justification: { type: 'string' },
    },
    required: ['file_path', 'sandbox_permissions', 'justification'],
  },
}
function decode(capture: any) {
  const msg = capture.messages.find((m: any) => m.message.case === 'execClientMessage' && m.message.value.message.case === 'requestContextResult')
  const tools = msg?.message.value.message.value.result.value.requestContext?.tools ?? []
  return tools.map((t: any) => toJson(ValueSchema, fromBinary(ValueSchema, t.inputSchema)) as any)
}
async function waitUntil(pred: () => boolean, timeoutMs = 2000) {
  const start = Date.now()
  while (!pred()) {
    if (Date.now() - start > timeoutMs) throw new Error('waitUntil timeout')
    await new Promise(r => setTimeout(r, 10))
  }
}
afterEach(async () => { await closeFakeRunServers() })
describe('narrow before buildMcpToolDefinitions', () => {
  it('direct stream narrows to danger-full-access for workspace-write', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, requestContext())
      await waitUntil(() => capture.messages.some((m: any) => m.message.case === 'execClientMessage' && m.message.value.message.case === 'requestContextResult'))
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const adapter = new CursorAdapter({ options: () => conn(fake.origin), resolveApiKey: () => Promise.resolve('tok') })
    const chunks = await collect(adapter.stream(request({ system: 'Current DSH file policy: workspace-write.', tools: [toolEsc] })))
    void chunks
    const decoded = decode(fake.captures[0])
    expect(decoded[0].properties.sandbox_permissions.enum).toEqual(['danger-full-access'])
    adapter.registry.dispose()
  })
  it('prepareCall stream narrows to no escalation for danger-full-access', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, requestContext())
      await waitUntil(() => capture.messages.some((m: any) => m.message.case === 'execClientMessage' && m.message.value.message.case === 'requestContextResult'))
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const adapter = new CursorAdapter({ options: () => conn(fake.origin), resolveApiKey: () => Promise.resolve('tok') })
    const prepared = await adapter.prepareCall('cursor', 'composer-2.5')
    const chunks = await collect(prepared.stream(request({ system: 'Current DSH file policy: danger-full-access.', tools: [toolEsc] })))
    void chunks
    const decoded = decode(fake.captures[0])
    expect(decoded[0].properties.sandbox_permissions).toBeUndefined()
    expect(decoded[0].properties.justification).toBeUndefined()
    expect(decoded[0].required).not.toContain('sandbox_permissions')
    adapter.registry.dispose()
  })
  it('stale system with newer danger-full-access message removes escalation (prepareCall)', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, requestContext())
      await waitUntil(() => capture.messages.some((m: any) => m.message.case === 'execClientMessage' && m.message.value.message.case === 'requestContextResult'))
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const adapter = new CursorAdapter({ options: () => conn(fake.origin), resolveApiKey: () => Promise.resolve('tok') })
    const prepared = await adapter.prepareCall('cursor', 'composer-2.5')
    const chunks = await collect(prepared.stream(request({ system: 'Current DSH file policy: workspace-write.', messages: [userText('Current DSH file policy: danger-full-access.')], tools: [toolEsc] })))
    void chunks
    const decoded = decode(fake.captures[0])
    expect(decoded[0].properties.sandbox_permissions).toBeUndefined()
    expect(decoded[0].properties.justification).toBeUndefined()
    adapter.registry.dispose()
  })
  it('scans context-injection messages when system lacks policy', async () => {
    const fake = await fakeRunServer(async (stream, capture) => {
      await waitUntil(() => capture.runRequest !== undefined)
      sendServer(stream, requestContext())
      await waitUntil(() => capture.messages.some((m: any) => m.message.case === 'execClientMessage' && m.message.value.message.case === 'requestContextResult'))
      sendServer(stream, textDelta('ok'))
      sendServer(stream, turnEnded())
      stream.end()
    })
    const adapter = new CursorAdapter({ options: () => conn(fake.origin), resolveApiKey: () => Promise.resolve('tok') })
    const chunks = await collect(adapter.stream(request({ system: 'plain system', messages: [userText('Current DSH file policy: workspace-write. extra')], tools: [toolEsc] })))
    void chunks
    const decoded = decode(fake.captures[0])
    expect(decoded[0].properties.sandbox_permissions.enum).toEqual(['danger-full-access'])
    adapter.registry.dispose()
  })
})
