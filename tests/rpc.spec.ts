import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import LlmRuntime from '@deepseek-ai/dsh-llm'
import {
  CURSOR_AUTH_LOGOUT_ENDPOINT,
  CURSOR_AUTH_STATUS_ENDPOINT,
  CURSOR_RPC_CHANNEL,
  CURSOR_USAGE_ENDPOINT,
  decodeCursorAuthStatus,
  decodeCursorUsageReply,
} from '../src/client-contract.ts'
import { apply, Config, createCursorRpcHandler, inject } from '../src/index.ts'
import { createCursorAuthRuntime } from '../src/oauth.ts'
import { writeSession } from '../src/session.ts'
import { jwt } from './helpers.ts'

afterEach(() => {
  vi.unstubAllGlobals()
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
})
