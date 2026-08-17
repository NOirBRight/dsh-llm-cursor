import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import LlmRuntime from '@deepseek-ai/dsh-llm'
import {
  CURSOR_AUTH_LOGOUT_ENDPOINT,
  CURSOR_AUTH_STATUS_ENDPOINT,
  CURSOR_MODELS_ENDPOINT,
  CURSOR_RPC_CHANNEL,
  CURSOR_SAVE_ENDPOINT,
  CURSOR_USAGE_ENDPOINT,
  decodeCursorAuthStatus,
  decodeCursorModelsReply,
  decodeCursorSaveResult,
  decodeCursorUsageReply,
} from '../src/client-contract.ts'
import type { CursorSettingsView } from '../src/client-contract.ts'
import { apply, Config, createCursorRpcHandler, inject } from '../src/index.ts'
import { createCursorAuthRuntime } from '../src/oauth.ts'
import { writeSession } from '../src/session.ts'
import { jwt } from './helpers.ts'
import { closeFakeRunServers, fakeRunServer } from './fake-run-server.ts'

afterEach(async () => {
  vi.unstubAllGlobals()
  await closeFakeRunServers()
})

type Handler = (
  endpoint: string,
  payload: unknown,
  signal: AbortSignal,
) => Promise<{ ok: boolean, value?: unknown, error?: { message: string } }>

describe('Cursor loopback auth RPC', () => {
  it('registers /cursor as a loopback channel', async () => {
    const ctx = new Context()
    await ctx.plugin(LlmRuntime).await()
    const handle = vi.fn((_channel: string, _handler: Handler, _options: { authority: 'loopback' }) =>
      () => Promise.resolve())
    ctx.provide('connection', { rpc: { handle } } as never)
    const fiber = ctx.plugin({ inject: [...inject], Config, apply }, {})
    await fiber.await()
    expect(handle).toHaveBeenCalledTimes(1)
    expect(handle.mock.calls[0]?.[0]).toBe(CURSOR_RPC_CHANNEL)
    expect(handle.mock.calls[0]?.[2]).toEqual({ authority: 'loopback' })
    await fiber.dispose()
    await ctx.fiber.dispose()
  })

  it('returns status without token fields and logout deletes the session', async () => {
    const path = join(await mkdtemp(join(tmpdir(), 'dsh-llm-cursor-rpc-')), 'cursor-oauth.json')
    const expiresAt = new Date(Date.now() + 60 * 60_000).toISOString()
    await writeSession(path, {
      accessToken: jwt({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 }),
      refreshToken: 'refresh-secret',
      expiresAt,
      email: 'user@example.test',
      userId: 'user-1',
    })
    const handler = createCursorRpcHandler(createCursorAuthRuntime({
      resolveSessionPath: () => path,
    }))
    const status = await handler(CURSOR_AUTH_STATUS_ENDPOINT, {}, new AbortController().signal)
    expect(status.ok).toBe(true)
    const decoded = decodeCursorAuthStatus(status.value)
    expect(decoded).toEqual({ loggedIn: true, email: 'user@example.test', expiresAt })
    expect(JSON.stringify(status.value)).not.toMatch(/refresh-secret|accessToken/u)

    const logout = await handler(CURSOR_AUTH_LOGOUT_ENDPOINT, {}, new AbortController().signal)
    expect(logout).toEqual({ ok: true, value: { ok: true } })
    const after = await handler(CURSOR_AUTH_STATUS_ENDPOINT, {}, new AbortController().signal)
    expect(decodeCursorAuthStatus(after.value)).toEqual({ loggedIn: false })
  })

  it('rejects token fields in RPC payloads and does not request usage when logged out', async () => {
    const path = join(await mkdtemp(join(tmpdir(), 'dsh-llm-cursor-rpc-')), 'cursor-oauth.json')
    const handler = createCursorRpcHandler(createCursorAuthRuntime({
      resolveSessionPath: () => path,
    }))
    const bad = await handler(CURSOR_AUTH_STATUS_ENDPOINT, { accessToken: 'nope' }, new AbortController().signal)
    expect(bad.ok).toBe(false)
    const usage = await handler(CURSOR_USAGE_ENDPOINT, {}, new AbortController().signal)
    expect(decodeCursorUsageReply(usage.value)).toEqual({ status: 'logged-out' })
  })

  it('commits the selected catalog through one revision-fenced settings mutation', async () => {
    const current: CursorSettingsView = {
      streamIdleTimeoutMs: 300_000,
    }
    let value: Record<string, unknown> = { ...current }
    let revision = 1
    const mutate = vi.fn(async (_ns: string, ops: readonly { op: string, path: readonly string[], value: unknown }[], expected: number) => {
      expect(expected).toBe(revision)
      const next = structuredClone(value)
      for (const op of ops) next[op.path[0] as string] = structuredClone(op.value)
      value = next
      revision += 1
    })
    const settings = {
      register: () => ({
        get: () => value,
        watch: () => () => undefined,
        update: () => Promise.resolve(),
        replace: () => Promise.resolve(),
      }),
      describe: () => [{ ns: 'llm-cursor', value, revision }],
      mutate,
    }
    const ctx = new Context()
    await ctx.plugin(LlmRuntime).await()
    const handle = vi.fn((_channel: string, _handler: Handler, _options: { authority: 'loopback' }) =>
      () => Promise.resolve())
    ctx.provide('connection', { rpc: { handle } } as never)
    ctx.provide('settings', settings as never)
    const fiber = ctx.plugin({ inject: [...inject], Config, apply }, {})
    await fiber.await()
    const handler = handle.mock.calls[0]?.[1]
    if (handler === undefined) throw new Error('Cursor RPC was not registered')

    const result = await handler(CURSOR_SAVE_ENDPOINT, {
      models: [{ id: 'composer-2.5', name: 'Composer 2.5', thinking: true, vision: true, maxMode: true }],
      expectedRevision: 1,
    }, new AbortController().signal)

    expect(result.ok).toBe(true)
    expect(decodeCursorSaveResult(result.value)).toEqual({
      settings: {
        streamIdleTimeoutMs: 300_000,
        models: [{ id: 'composer-2.5', name: 'Composer 2.5', thinking: true, vision: true, maxMode: true }],
      },
      revision: 2,
    })
    expect(mutate).toHaveBeenCalledTimes(1)
    expect(mutate.mock.calls[0]?.[1]).toEqual([
      {
        op: 'set',
        path: ['models'],
        value: [{ id: 'composer-2.5', name: 'Composer 2.5', thinking: true, vision: true, maxMode: true }],
      },
    ])

    await fiber.dispose()
    await ctx.fiber.dispose()
  })

  it('persists an empty catalog instead of treating it as the inherited seed', async () => {
    const current: CursorSettingsView = {
      streamIdleTimeoutMs: 300_000,
    }
    let value: Record<string, unknown> = { ...current }
    let revision = 1
    const mutate = vi.fn(async (_ns: string, ops: readonly { op: string, path: readonly string[], value: unknown }[], expected: number) => {
      expect(expected).toBe(revision)
      const next = structuredClone(value)
      for (const op of ops) next[op.path[0] as string] = structuredClone(op.value)
      value = next
      revision += 1
    })
    const settings = {
      register: () => ({
        get: () => value,
        watch: () => () => undefined,
        update: () => Promise.resolve(),
        replace: () => Promise.resolve(),
      }),
      describe: () => [{ ns: 'llm-cursor', value, revision }],
      mutate,
    }
    const ctx = new Context()
    await ctx.plugin(LlmRuntime).await()
    const handle = vi.fn((_channel: string, _handler: Handler, _options: { authority: 'loopback' }) =>
      () => Promise.resolve())
    ctx.provide('connection', { rpc: { handle } } as never)
    ctx.provide('settings', settings as never)
    const fiber = ctx.plugin({ inject: [...inject], Config, apply }, {})
    await fiber.await()
    const handler = handle.mock.calls[0]?.[1]
    if (handler === undefined) throw new Error('Cursor RPC was not registered')

    const result = await handler(CURSOR_SAVE_ENDPOINT, {
      models: [],
      expectedRevision: 1,
    }, new AbortController().signal)

    expect(result.ok).toBe(true)
    expect(decodeCursorSaveResult(result.value)).toEqual({
      settings: {
        streamIdleTimeoutMs: 300_000,
        models: [],
      },
      revision: 2,
    })
    expect(mutate.mock.calls[0]?.[1]).toEqual([
      { op: 'set', path: ['models'], value: [] },
    ])

    await fiber.dispose()
    await ctx.fiber.dispose()
  })

  it('refuses models/list when signed out and returns the account catalog when signed in', async () => {
    const path = join(await mkdtemp(join(tmpdir(), 'dsh-llm-cursor-rpc-')), 'cursor-oauth.json')
    const signedOut = createCursorRpcHandler(createCursorAuthRuntime({
      resolveSessionPath: () => path,
    }))
    const missing = await signedOut(CURSOR_MODELS_ENDPOINT, {}, new AbortController().signal)
    expect(missing.ok).toBe(false)

    await writeSession(path, {
      accessToken: jwt({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 }),
      refreshToken: 'refresh-secret',
      expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
      userId: 'user-1',
    })
    const fake = await fakeRunServer(async () => undefined)
    const handler = createCursorRpcHandler(createCursorAuthRuntime({
      resolveSessionPath: () => path,
    }), { apiURL: fake.origin })
    const listed = await handler(CURSOR_MODELS_ENDPOINT, {}, new AbortController().signal)
    expect(listed.ok).toBe(true)
    const models = decodeCursorModelsReply(listed.value)
    expect(models?.models.some(model => model.id === 'composer-2.5' || model.id === 'default')).toBe(true)
  })

  it('writes usage email onto the session without leaking tokens', async () => {
    const path = join(await mkdtemp(join(tmpdir(), 'dsh-llm-cursor-rpc-')), 'cursor-oauth.json')
    await writeSession(path, {
      accessToken: jwt({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 }),
      refreshToken: 'refresh-secret',
      expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
      userId: 'user-1',
    })
    const { createServer } = await import('node:http')
    const server = createServer((req, res) => {
      res.setHeader('content-type', 'application/json')
      if (req.url === '/auth/usage') {
        res.end(JSON.stringify({ 'gpt-4': { numRequests: 1, maxRequestUsage: 10 } }))
        return
      }
      if (req.url === '/usage-summary') {
        res.end(JSON.stringify({
          individualUsage: { plan: { autoPercentUsed: 2, apiPercentUsed: 0 } },
        }))
        return
      }
      res.end(JSON.stringify({ email: 'card@example.test' }))
    })
    await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve) })
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('no port')
    const origin = `http://127.0.0.1:${String(address.port)}`
    const handler = createCursorRpcHandler(createCursorAuthRuntime({
      resolveSessionPath: () => path,
    }), {
      usageURL: `${origin}/auth/usage`,
      usageSummaryURL: `${origin}/usage-summary`,
      authMeURL: `${origin}/auth/me`,
    })
    const usage = await handler(CURSOR_USAGE_ENDPOINT, {}, new AbortController().signal)
    expect(usage.ok).toBe(true)
    expect(JSON.stringify(usage.value)).not.toMatch(/refresh-secret/u)
    expect(decodeCursorUsageReply(usage.value)?.status).toBe('ok')
    const { readSession } = await import('../src/session.ts')
    expect((await readSession(path))?.email).toBe('card@example.test')
    await new Promise<void>((resolve, reject) => { server.close(error => { error ? reject(error) : resolve() }) })
  })
})
