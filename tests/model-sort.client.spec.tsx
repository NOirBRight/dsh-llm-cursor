// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import { CursorPluginCard } from '../src/client/CursorPluginCard.tsx'
import type { CursorPluginCardProps } from '../src/client/CursorPluginCard.tsx'
import { en } from '../src/client/locales.ts'
import type { CursorSettingsView } from '../src/client-contract.ts'

afterEach(() => { cleanup() })

const settings: CursorSettingsView = {
  streamIdleTimeoutMs: 300_000,
  models: [{ id: 'b' }, { id: 'a' }],
}

function snapshot(): SettingsScopeSnapshot<CursorSettingsView> {
  return { status: 'ready', value: settings, base: settings, user: { models: settings.models }, revision: 1, writable: true, mode: 'host' }
}

function props(): CursorPluginCardProps {
  const current = snapshot()
  return {
    t: key => en[key],
    useCursorSettings: (selector: (value: SettingsScopeSnapshot<CursorSettingsView>) => unknown) => selector(current),
    startAuth: vi.fn(),
    cancelAuth: vi.fn(),
    readAuthStatus: vi.fn(() => Promise.resolve({ loggedIn: false as const })),
    logout: vi.fn(),
    fetchUsage: vi.fn(),
    discoverModels: vi.fn(() => Promise.resolve([])),
    saveConfiguration: vi.fn(next => Promise.resolve({ settings: next, revision: 2 })),
    beginModelPicker: vi.fn(),
    completeModelPicker: vi.fn(),
    failModelPicker: vi.fn(),
    closeModelPicker: vi.fn(),
  } as unknown as CursorPluginCardProps
}

describe('CursorPluginCard model sort mode', () => {
  it('toggles explicit sort mode while keeping model input state', () => {
    render(<CursorPluginCard {...props()} />)
    fireEvent.click(screen.getByRole('button', { name: en.expand + ': ' + en.title }))
    fireEvent.click(screen.getByRole('button', { name: en.models }))
    const first = screen.getByLabelText(en.modelId + ' 1') as HTMLInputElement
    fireEvent.change(first, { target: { value: 'b-edited' } })
    expect(first.value).toBe('b-edited')
    expect(screen.queryByRole('button', { name: en.moveUp + ': b-edited' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: en.sortModels }))
    expect(screen.getByRole('button', { name: en.doneSorting })).toBeTruthy()
    expect((screen.getByLabelText(en.modelId + ' 1') as HTMLInputElement).value).toBe('b-edited')
    expect(screen.getByRole('button', { name: en.moveUp + ': b-edited' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: en.doneSorting }))
    expect(screen.getByRole('button', { name: en.sortModels })).toBeTruthy()
    expect((screen.getByLabelText(en.modelId + ' 1') as HTMLInputElement).value).toBe('b-edited')
  })
})
