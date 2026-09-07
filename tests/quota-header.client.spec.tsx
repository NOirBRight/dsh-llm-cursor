// @vitest-environment jsdom
// Collapsed header quota: usage loads on sign-in without expansion, expansion never refires, failures stay truthful.
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearProviderUsageCache, peekCachedUsage, rememberHeadlineQuota } from 'dsh-llm-providers-ui/usage-readers'
import type { SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import { CursorPluginCard } from '../src/client/CursorPluginCard.tsx'
import type { CursorPluginCardProps } from '../src/client/CursorPluginCard.tsx'
import { en } from '../src/client/locales.ts'
import type { CursorSettingsView, CursorUsageReply } from '../src/client-contract.ts'

afterEach(() => { cleanup(); clearProviderUsageCache() })

const settings: CursorSettingsView = {
  streamIdleTimeoutMs: 300_000,
  models: [{ id: 'b' }, { id: 'a' }],
}

const usageOk: CursorUsageReply = {
  status: 'ok',
  usage: { fetchedAt: '2026-09-01T00:00:00.000Z', windows: [{ id: 'month', used: 20, limit: 100 }] },
}

function props(overrides: Record<string, unknown> = {}): CursorPluginCardProps {
  const current: SettingsScopeSnapshot<CursorSettingsView> = {
    status: 'ready', value: settings, base: settings, user: { models: settings.models }, revision: 1, writable: true, mode: 'host',
  }
  return {
    t: (key: keyof typeof en) => en[key],
    useCursorSettings: (selector: (value: SettingsScopeSnapshot<CursorSettingsView>) => unknown) => selector(current),
    startAuth: vi.fn(),
    cancelAuth: vi.fn(),
    readAuthStatus: vi.fn(() => Promise.resolve({ loggedIn: true as const })),
    logout: vi.fn(),
    fetchUsage: vi.fn(() => Promise.resolve(usageOk)),
    discoverModels: vi.fn(() => Promise.resolve([])),
    saveConfiguration: vi.fn(next => Promise.resolve({ settings: next, revision: 2 })),
    beginModelPicker: vi.fn(),
    completeModelPicker: vi.fn(),
    failModelPicker: vi.fn(),
    closeModelPicker: vi.fn(),
    ...overrides,
  } as unknown as CursorPluginCardProps
}

describe('CursorPluginCard collapsed quota', () => {
  it('shows header quota while collapsed and does not reload on expansion', async () => {
    const fetchUsage = vi.fn(() => Promise.resolve(usageOk))
    render(<CursorPluginCard {...props({ fetchUsage })} />)

    const meter = await screen.findByRole('meter', { name: 'month' })
    expect(meter.getAttribute('aria-valuenow')).toBe('80')
    expect(fetchUsage).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: en.expand + ': ' + en.title }))
    await screen.findByRole('button', { name: en.signOut })
    expect(screen.getAllByRole('meter', { name: 'month' }).length).toBeGreaterThanOrEqual(2)
    expect(fetchUsage).toHaveBeenCalledTimes(1)
  })

  it('reports a usage read failure truthfully with a collapsed unavailable dash', async () => {
    const fetchUsage = vi.fn(() => Promise.reject(new Error('usage down')))
    render(<CursorPluginCard {...props({ fetchUsage })} />)

    await waitFor(() => { expect(fetchUsage).toHaveBeenCalledTimes(1) })
    // Truthful unavailable state: dash mini, never a fabricated percent.
    expect(document.querySelector('[data-provider-quota-mini] [data-provider-quota-missing]')).not.toBeNull()
    expect(screen.queryByRole('meter')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: en.expand + ': ' + en.title }))
    await screen.findByText('usage down')
    expect(fetchUsage).toHaveBeenCalledTimes(1)
  })

  it('drops a late usage success that resolves after sign-out', async () => {
    let resolveUsage!: (value: CursorUsageReply) => void
    const fetchUsage = vi.fn(() => new Promise<CursorUsageReply>(resolve => { resolveUsage = resolve }))
    const logout = vi.fn(() => Promise.resolve())
    render(<CursorPluginCard {...props({ fetchUsage, logout })} />)

    await waitFor(() => { expect(fetchUsage).toHaveBeenCalledTimes(1) })
    fireEvent.click(screen.getByRole('button', { name: en.expand + ': ' + en.title }))
    fireEvent.click(await screen.findByRole('button', { name: en.signOut }))
    await waitFor(() => { expect(logout).toHaveBeenCalledTimes(1) })

    await act(async () => { resolveUsage(usageOk) })
    expect(fetchUsage).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('meter')).toBeNull()
    expect(peekCachedUsage('llm-cursor')).toBeUndefined()
  })

  it('drops the header meter when a refresh fails after success, keeping old data with warning', async () => {
    let failNext = false
    const fetchUsage = vi.fn(() => failNext ? Promise.reject(new Error('usage down')) : Promise.resolve(usageOk))
    render(<CursorPluginCard {...props({ fetchUsage })} />)

    await screen.findByRole('meter', { name: 'month' })
    fireEvent.click(screen.getByRole('button', { name: en.expand + ': ' + en.title }))
    failNext = true
    fireEvent.click(await screen.findByRole('button', { name: en.usageRefresh }))
    await screen.findByText(en.usageRefreshFailed)
    expect(fetchUsage).toHaveBeenCalledTimes(2)
    expect(document.querySelector('[data-provider-quota-mini] [data-provider-quota-missing]')).not.toBeNull()
    expect(screen.getAllByRole('meter', { name: 'month' })).toHaveLength(1)
  })

  it('hides cached quota once signed-out is authoritative', async () => {
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 64 })
    const fetchUsage = vi.fn(() => Promise.resolve(usageOk))
    render(<CursorPluginCard {...props({ fetchUsage, readAuthStatus: vi.fn(() => Promise.resolve({ loggedIn: false as const })) })} />)
    await screen.findByText(en.signedOut)
    expect(fetchUsage).not.toHaveBeenCalled()
    expect(screen.queryByRole('meter')).toBeNull()
  })

  it('drops a stale initial signed-out verdict that resolves after a new login', async () => {
    let resolveInitialAuth!: (value: { loggedIn: boolean }) => void
    let authCalls = 0
    const readAuthStatus = vi.fn(() => {
      authCalls += 1
      if (authCalls === 1) return new Promise<{ loggedIn: boolean }>(resolve => { resolveInitialAuth = resolve })
      return Promise.resolve({ loggedIn: true as const })
    })
    const startAuth = vi.fn(() => Promise.resolve({ ok: true as const }))
    const fetchUsage = vi.fn(() => Promise.resolve(usageOk))
    render(<CursorPluginCard {...props({ fetchUsage, readAuthStatus, startAuth })} />)

    await waitFor(() => { expect(readAuthStatus).toHaveBeenCalledTimes(1) })
    fireEvent.click(screen.getByRole('button', { name: en.expand + ': ' + en.title }))
    fireEvent.click(await screen.findByRole('button', { name: en.signIn }))
    await waitFor(() => { expect(screen.getAllByRole('meter', { name: 'month' })).toHaveLength(2) })

    await act(async () => { resolveInitialAuth({ loggedIn: false }) })
    expect(fetchUsage).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: en.signOut })).not.toBeNull()
    expect(screen.getAllByRole('meter', { name: 'month' })).toHaveLength(2)
  })

  it('shows cached quota on first paint before the usage RPC returns', async () => {
    rememberHeadlineQuota('llm-cursor', 'Cursor', { label: 'W', remainingPercent: 64 })
    const fetchUsage = vi.fn(() => new Promise(() => { /* hang */ }))
    render(<CursorPluginCard {...props({ fetchUsage, readAuthStatus: vi.fn(() => new Promise(() => { /* hang */ })) })} />)
    const meter = await screen.findByRole('meter')
    expect(meter.getAttribute('aria-valuenow')).toBe('64')
    expect(fetchUsage).toHaveBeenCalledTimes(0)
  })
})
