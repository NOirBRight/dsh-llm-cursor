// @vitest-environment jsdom
// Collapsed header quota: usage loads on sign-in without expansion, expansion never refires, failures stay truthful.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import { CursorPluginCard } from '../src/client/CursorPluginCard.tsx'
import type { CursorPluginCardProps } from '../src/client/CursorPluginCard.tsx'
import { en } from '../src/client/locales.ts'
import type { CursorSettingsView, CursorUsageReply } from '../src/client-contract.ts'

afterEach(() => { cleanup() })

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
})
