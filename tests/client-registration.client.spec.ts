// @vitest-environment jsdom

import { Context, Service } from '@deepseek-ai/cordis'
import { describe, expect, it, vi } from 'vitest'
import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { CursorSettingsView } from '../src/client-contract.ts'
import { apply, inject } from '../src/client/index.ts'
import { clearProviderUsageCache, peekCachedUsage, rememberHeadlineQuota } from 'dsh-llm-providers-ui/usage-readers'

const value: CursorSettingsView = {
  streamIdleTimeoutMs: 300_000,
}

function scope(): SettingsScope<CursorSettingsView> {
  const snapshot: SettingsScopeSnapshot<CursorSettingsView> = {
    status: 'ready',
    value,
    base: value,
    user: {},
    revision: 1,
    writable: true,
    mode: 'host',
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: () => () => undefined,
    mutate: vi.fn(() => Promise.resolve()),
    set: vi.fn(() => Promise.resolve()),
    unset: vi.fn(() => Promise.resolve()),
  }
}

interface SlotEntry {
  options: Record<string, unknown>
  inject?: () => unknown
}

class FakeSlots extends Service {
  private readonly registered: SlotEntry[] = []
  private readonly listeners = new Map<string, Set<() => void>>()

  constructor(ctx: Context) { super(ctx, 'slots') }

  inject(_name: string, register: () => () => void): void { this.ctx.effect(register) }

  subscribe(name: string, listener: () => void): () => void {
    const listeners = this.listeners.get(name) ?? new Set<() => void>()
    listeners.add(listener)
    this.listeners.set(name, listeners)
    return () => { listeners.delete(listener); if (listeners.size === 0) this.listeners.delete(name) }
  }

  register(options: Record<string, unknown> & { inject?: () => unknown }, _component: unknown): () => void {
    const entry = { options, inject: options.inject }
    this.registered.push(entry)
    this.listeners.get(String(options['name']))?.forEach(listener => { listener() })
    return () => {
      const index = this.registered.indexOf(entry)
      if (index < 0) return
      this.registered.splice(index, 1)
      this.listeners.get(String(options['name']))?.forEach(listener => { listener() })
    }
  }

  entries(name: string): readonly SlotEntry[] {
    return this.registered.filter(entry => entry.options['name'] === name)
  }
}

async function bench(rpcCall?: (channel: string, endpoint: string, payload: unknown) => Promise<unknown>) {
  const ctx = new Context()
  await ctx.plugin(FakeSlots).await()
  const slots = ctx.get('slots') as FakeSlots
  ctx.provide('locale', {
    register: () => () => undefined,
    bind: () => (key: string) => key,
  } as never)
  ctx.provide('settingsScope', { bind: () => scope() } as never)
  ctx.provide('connection', {
    isLoopback: true,
    rpc: {
      call: rpcCall ?? (async (channel: string, endpoint: string, payload: unknown) => {
        if (endpoint === 'usage/read') {
          return {
            ok: true,
            value: {
              status: 'ok',
              usage: {
                fetchedAt: '2026-08-17T00:00:00.000Z',
                windows: [{ id: 'Cursor Models', used: 1.4, limit: 100, unit: 'percent' }],
              },
            },
          }
        }
        return { ok: true, value: { models: [] } }
      }),
    },
  } as never)
  return { ctx, slots }
}

describe('Cursor client plugin registration', () => {
  it('declares only the client services it consumes', () => {
    expect(inject).toEqual(['slots', 'locale', 'connection', 'settingsScope'])
  })

  it('registers the card and frame picker, then removes both with the plugin fiber', async () => {
    const { ctx, slots } = await bench()
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()

    expect(slots.entries('settings.section')).toHaveLength(0) // owned by dsh-llm-providers-ui
    const entries = slots.entries('settings.provider.item')
    expect(entries).toHaveLength(1)
    expect(entries[0]?.options).toMatchObject({ key: 'llm-cursor' })
    const face = (entries[0] as { inject?: () => unknown }).inject?.() as { hooks: Record<string, unknown> }
    expect(Object.keys(face.hooks)).toEqual(['cursorSettings'])
    const overlays = slots.entries('shell.overlay')
    expect(overlays).toHaveLength(1)
    expect(overlays[0]?.options).toMatchObject({ id: 'cursor-model-picker', order: 101 })

    await fiber.dispose()

    expect(slots.entries('settings.provider.item')).toHaveLength(0)
    expect(slots.entries('settings.section')).toHaveLength(0)
    expect(slots.entries('shell.overlay')).toHaveLength(0)
    await ctx.fiber.dispose()
  })

  it('holds the missing-owner warning through the grace period and drops it when the owner registers', async () => {
    vi.useFakeTimers()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { ctx, slots } = await bench()
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()

    await vi.advanceTimersByTimeAsync(14_000)
    expect(warn).not.toHaveBeenCalled()

    slots.register({ name: 'settings.section', id: 'providers' }, undefined)
    await vi.advanceTimersByTimeAsync(2_000)
    expect(warn).not.toHaveBeenCalled()

    vi.useRealTimers()
    warn.mockRestore()
    await fiber.dispose(); await ctx.fiber.dispose()
  })

  it('warns once when the owner never registers within the grace period', async () => {
    vi.useFakeTimers()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const { ctx } = await bench()
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()

    await vi.advanceTimersByTimeAsync(15_000)
    expect(warn).toHaveBeenCalledTimes(1)
    expect(String(warn.mock.calls[0]?.[0])).toContain('LLM Providers page missing for card llm-cursor')

    vi.useRealTimers()
    warn.mockRestore()
    await fiber.dispose(); await ctx.fiber.dispose()
  })

  it('reserves a blank window before auth RPC and navigates that same window', async () => {
    let resolveStart: ((value: unknown) => void) | undefined
    const call = vi.fn((_channel: string, endpoint: string) => {
      if (endpoint === 'auth/start') return new Promise(resolve => { resolveStart = resolve })
      if (endpoint === 'auth/status') return Promise.resolve({ ok: true, value: { loggedIn: false } })
      return Promise.resolve({ ok: true, value: { models: [] } })
    })
    const popup = { opener: {}, closed: false, location: { href: 'about:blank' }, close: vi.fn() }
    const open = vi.spyOn(window, 'open').mockReturnValue(popup as unknown as Window)
    const { ctx, slots } = await bench(call)
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const face = (slots.entries('settings.provider.item')[0] as { inject?: () => { startAuth: () => Promise<unknown> } }).inject?.()
    const started = face?.startAuth()
    expect(open).toHaveBeenCalledWith('about:blank', '_blank')
    expect(popup.opener).toBeNull()
    expect(popup.location.href).toBe('about:blank')
    resolveStart?.({ ok: true, value: { ok: true, attemptId: 'attempt-1', authorizationUrl: 'https://cursor.com/login' } })
    await expect(started).resolves.toMatchObject({ ok: true, attemptId: 'attempt-1' })
    expect(popup.location.href).toBe('https://cursor.com/login')
    open.mockRestore()
    await fiber.dispose(); await ctx.fiber.dispose()
  })

  it('returns a visible fallback URL when the popup is blocked', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const { ctx, slots } = await bench(async (_channel, endpoint) => endpoint === 'auth/start'
      ? { ok: true, value: { ok: true, attemptId: 'attempt-2', authorizationUrl: 'https://cursor.com/login' } }
      : { ok: true, value: { loggedIn: false } })
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const face = (slots.entries('settings.provider.item')[0] as { inject?: () => { startAuth: () => Promise<unknown> } }).inject?.()
    await expect(face?.startAuth()).resolves.toMatchObject({
      ok: true, attemptId: 'attempt-2', popupBlocked: true, fallbackUrl: 'https://cursor.com/login',
    })
    open.mockRestore()
    await fiber.dispose(); await ctx.fiber.dispose()
  })

  it('reads usage through the cursor usage/read RPC without exposing tokens', async () => {
    const { ctx, slots } = await bench()
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()

    const face = (slots.entries('settings.provider.item')[0] as {
      inject?: () => { fetchUsage: () => Promise<unknown> }
    }).inject?.()
    const usage = await face?.fetchUsage()
    expect(usage).toEqual({
      status: 'ok',
      usage: {
        fetchedAt: '2026-08-17T00:00:00.000Z',
        windows: [{ id: 'Cursor Models', used: 1.4, limit: 100, unit: 'percent' }],
      },
    })
    await fiber.dispose()
    await ctx.fiber.dispose()
  })

  it('purges persisted quota on logout without a provider directory', async () => {
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 64 })
    const { ctx, slots } = await bench(async (_channel, endpoint) => endpoint === 'auth/logout'
      ? { ok: true, value: { ok: true } }
      : { ok: true, value: { loggedIn: false } })
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const face = (slots.entries('settings.provider.item')[0] as { inject?: () => { logout: () => Promise<unknown> } }).inject?.()
    await face?.logout()
    expect(peekCachedUsage('llm-cursor')).toBeUndefined()
    clearProviderUsageCache()
    await fiber.dispose(); await ctx.fiber.dispose()
  })

  it('purges seeded quota on an authoritative signed-out status', async () => {
    const { ctx, slots } = await bench(async () => ({ ok: true, value: { loggedIn: false } }))
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 64 })
    const face = (slots.entries('settings.provider.item')[0] as { inject?: () => { readAuthStatus: () => Promise<unknown> } }).inject?.()
    await face?.readAuthStatus()
    expect(peekCachedUsage('llm-cursor')).toBeUndefined()
    clearProviderUsageCache()
    await fiber.dispose(); await ctx.fiber.dispose()
  })

  it('purges seeded quota on a logged-out usage response without waiting for auth/status', async () => {
    const { ctx, slots } = await bench(async (_channel, endpoint) => endpoint === 'usage/read'
      ? { ok: true, value: { status: 'logged-out' } }
      : { ok: true, value: { loggedIn: false } })
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 64 })
    expect(peekCachedUsage('llm-cursor')).not.toBeUndefined()
    const face = (slots.entries('settings.provider.item')[0] as { inject?: () => { fetchUsage: () => Promise<unknown> } }).inject?.()
    await expect(face?.fetchUsage()).resolves.toEqual({ status: 'logged-out' })
    expect(peekCachedUsage('llm-cursor')).toBeUndefined()
    clearProviderUsageCache()
    await fiber.dispose(); await ctx.fiber.dispose()
  })

  it('ignores a stale signed-out status that resolves after a new login', async () => {
    let resolveOld: ((value: unknown) => void) | undefined
    let statusCalls = 0
    const { ctx, slots } = await bench(async (_channel, endpoint) => {
      if (endpoint === 'auth/status') {
        statusCalls += 1
        if (statusCalls === 2) return new Promise<unknown>(resolve => { resolveOld = resolve })
        return { ok: true, value: { loggedIn: true, attempt: 'succeeded' } }
      }
      return { ok: true, value: { loggedIn: false } }
    })
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const face = (slots.entries('settings.provider.item')[0] as { inject?: () => { readAuthStatus: () => Promise<unknown> } }).inject?.()
    const old = face?.readAuthStatus()
    await face?.readAuthStatus()
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 77 })
    resolveOld?.({ ok: true, value: { loggedIn: false } })
    await expect(old).resolves.toMatchObject({ loggedIn: false })
    expect(peekCachedUsage('llm-cursor')?.windows[0]?.remainingPercent).toBe(77)
    clearProviderUsageCache()
    await fiber.dispose(); await ctx.fiber.dispose()
  })

  it('ignores stale logged-out usage that resolves after an account switch', async () => {
    let resolveOld: ((value: unknown) => void) | undefined
    let usageCalls = 0
    const { ctx, slots } = await bench(async (_channel, endpoint) => {
      if (endpoint === 'auth/status') return { ok: true, value: { loggedIn: true, attempt: 'succeeded' } }
      if (endpoint === 'usage/read') {
        usageCalls += 1
        if (usageCalls === 1) return new Promise<unknown>(resolve => { resolveOld = resolve })
      }
      return { ok: true, value: { loggedIn: false } }
    })
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const face = (slots.entries('settings.provider.item')[0] as { inject?: () => {
      readAuthStatus: () => Promise<unknown>
      fetchUsage: () => Promise<unknown>
    } }).inject?.()
    const old = face?.fetchUsage()
    await face?.readAuthStatus()
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 77 })
    resolveOld?.({ ok: true, value: { status: 'logged-out' } })
    await expect(old).resolves.toEqual({ status: 'logged-out' })
    expect(peekCachedUsage('llm-cursor')?.windows[0]?.remainingPercent).toBe(77)
    clearProviderUsageCache()
    await fiber.dispose(); await ctx.fiber.dispose()
  })

  it('purges persisted quota when a sign-in attempt succeeds', async () => {
    const { ctx, slots } = await bench(async () => ({ ok: true, value: { loggedIn: true, attempt: 'succeeded' } }))
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 64 })
    const face = (slots.entries('settings.provider.item')[0] as { inject?: () => { readAuthStatus: () => Promise<unknown> } }).inject?.()
    await face?.readAuthStatus()
    expect(peekCachedUsage('llm-cursor')).toBeUndefined()
    clearProviderUsageCache()
    await fiber.dispose(); await ctx.fiber.dispose()
  })

  it('does not publish a stale signed-out account after a later login', async () => {
    let resolveOld: ((value: unknown) => void) | undefined
    let statusCalls = 0
    let account = (): { state: string } => ({ state: 'unknown' })
    const { ctx, slots } = await bench(async (_channel, endpoint) => {
      if (endpoint === 'auth/status') {
        statusCalls += 1
        if (statusCalls === 1) return new Promise<unknown>(resolve => { resolveOld = resolve })
        return { ok: true, value: { loggedIn: true, attempt: 'succeeded' } }
      }
      return { ok: true, value: { loggedIn: false } }
    })
    ctx.provide('providerDirectory', {
      register: (declaration: { account?: () => { state: string } }) => {
        if (declaration.account !== undefined) account = declaration.account
        return () => undefined
      },
      update: () => undefined,
      invalidateUsage: () => undefined,
    } as never)
    const fiber = ctx.plugin({ inject: [...inject], apply })
    await fiber.await()
    const face = (slots.entries('settings.provider.item')[0] as { inject?: () => { readAuthStatus: () => Promise<unknown> } }).inject?.()
    await face?.readAuthStatus()
    expect(account()).toEqual({ state: 'connected' })
    resolveOld?.({ ok: true, value: { loggedIn: false } })
    await Promise.resolve()
    expect(account()).toEqual({ state: 'connected' })
    await fiber.dispose(); await ctx.fiber.dispose()
  })
})
