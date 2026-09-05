/** Browser half: Cursor setup inside Plugin configuration. */

import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type { SettingsScope } from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { createCursorUsageReader } from 'dsh-llm-providers-ui/usage-readers'

/** Register this card and its quota reader on the shared Provider directory. */
function installProviderDirectory(ctx: { get(name: string, strict?: boolean): unknown, effect(effect: () => () => void, label?: string): void }): void {
  let directory: { register(entry: { key: string, usage: unknown }): () => void } | undefined
  try {
    directory = ctx.get('providerDirectory', false) as { register(entry: { key: string, usage: unknown }): () => void } | undefined
  } catch {
    return
  }
  if (directory === undefined) return
  ctx.effect(() => directory.register({ key: CURSOR_SETTINGS_NAMESPACE, usage: createCursorUsageReader() }), 'dsh-llm-cursor: provider directory registration')
}

import {
  CURSOR_AUTH_CANCEL_ENDPOINT,
  CURSOR_AUTH_LOGOUT_ENDPOINT,
  CURSOR_AUTH_START_ENDPOINT,
  CURSOR_SETTINGS_READ_ENDPOINT,
  CURSOR_AUTH_STATUS_ENDPOINT,
  CURSOR_RPC_CHANNEL,
  CURSOR_MODELS_ENDPOINT,
  CURSOR_SAVE_ENDPOINT,
  CURSOR_SETTINGS_NAMESPACE,
  CURSOR_USAGE_ENDPOINT,
  decodeCursorAuthLogoutReply,
  decodeCursorAuthStartReply,
  decodeCursorAuthStatus,
  decodeCursorModelsReply,
  decodeCursorSaveResult,
  decodeCursorSettings,
  decodeCursorUsageReply,
} from '../client-contract.ts'
import type { CursorSettingsView } from '../client-contract.ts'
import { CursorPluginCard } from './CursorPluginCard.tsx'
import type { CursorPluginCardFace } from './CursorPluginCard.tsx'
import { CursorModelPicker, CursorModelPickerController } from './CursorModelPicker.tsx'
import type { CursorModelPickerFace } from './CursorModelPicker.tsx'
import { en, zh } from './locales.ts'
import type { CursorSettingsKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    'settings.provider.item': { kind: 'keyed'; scope: 'root' }
  }
}
declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'settings.cursor': CursorSettingsKey
  }
}

export const name = 'dsh-llm-cursor-client'
export const inject = ['slots', 'locale', 'connection', 'settingsScope']


export function apply(ctx: ClientContext): void {
  installProviderDirectory(ctx)

  const localeNamespace = 'settings.cursor'
  ctx.effect(
    () => ctx.locale.register(localeNamespace, { zh, en }),
    'dsh-llm-cursor: Plugin configuration copy',
  )
  const t = ctx.locale.bind(localeNamespace) as CursorPluginCardFace['t']
  const localScope = ctx.settingsScope.bind<CursorSettingsView>({
    namespace: CURSOR_SETTINGS_NAMESPACE,
    decode: decodeCursorSettings,
  })
  const connection = ctx.get('connection') as unknown as ConnectionHandle
  const { rpc } = connection
  let remoteSnapshot: ReturnType<typeof localScope.getSnapshot> = { status: 'loading', value: undefined, base: undefined, user: undefined, revision: undefined, writable: true, mode: 'host' }
  const remoteListeners = new Set<() => void>()
  const remoteScope: SettingsScope<CursorSettingsView> = {
    getSnapshot: () => remoteSnapshot,
    subscribe: (listener: () => void) => { remoteListeners.add(listener); return () => { remoteListeners.delete(listener) } },
    mutate: async () => { throw new Error('Use the provider save action') },
    set: async () => { throw new Error('Use the provider save action') },
    unset: async () => { throw new Error('Use the provider save action') },
  }
  const publishRemoteSettings = (settings: CursorSettingsView, revision: number): void => {
    remoteSnapshot = { status: 'ready', value: settings, base: undefined, user: settings, revision, writable: true, mode: 'host' }
    for (const listener of remoteListeners) listener()
  }
  if (!connection.isLoopback) {
    void rpc.call(CURSOR_RPC_CHANNEL, CURSOR_SETTINGS_READ_ENDPOINT, {}).then(result => {
      if (!result.ok) return
      const value = result.value as { settings?: unknown, revision?: unknown }
      const settings = decodeCursorSettings(value.settings)
      if (settings === undefined || !Number.isSafeInteger(value.revision)) return
      publishRemoteSettings(settings, value.revision as number)
    })
  }
  const scope = connection.isLoopback ? localScope : remoteScope
  const picker = new CursorModelPickerController()

  const startAuth: CursorPluginCardFace['startAuth'] = async () => {
    // Open synchronously in the click handler so popup blockers cannot discard the flow.
    const popup = window.open('about:blank', '_blank')
    if (popup !== null) popup.opener = null
    const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_START_ENDPOINT, {})
    if (!result.ok) { popup?.close(); return { ok: false, retryable: true, message: result.error.message } }
    const decoded = decodeCursorAuthStartReply(result.value)
    if (decoded === undefined) { popup?.close(); return { ok: false, retryable: true, message: t('signInFailed') } }
    if (decoded.ok && 'authorizationUrl' in decoded) {
      if (popup === null) {
        // Card renders this action; never navigate the DSH tab implicitly.
        return { ok: true, attemptId: decoded.attemptId, authorizationUrl: decoded.authorizationUrl, popupBlocked: true, fallbackUrl: decoded.authorizationUrl }
      } else {
        popup.location.href = decoded.authorizationUrl
      }
    } else { popup?.close() }
    return decoded
  }

  const cancelAuth: CursorPluginCardFace['cancelAuth'] = async (attemptId) => {
    const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_CANCEL_ENDPOINT, { attemptId })
    if (!result.ok) throw new Error(result.error.message)
  }

  const readAuthStatus: CursorPluginCardFace['readAuthStatus'] = async (attemptId) => {
    const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_STATUS_ENDPOINT, attemptId === undefined ? {} : { attemptId })
    if (!result.ok) throw new Error(result.error.message)
    const decoded = decodeCursorAuthStatus(result.value)
    if (decoded === undefined) throw new Error(t('statusFailed'))
    return decoded
  }

  const logout: CursorPluginCardFace['logout'] = async () => {
    const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_LOGOUT_ENDPOINT, {})
    if (!result.ok) throw new Error(result.error.message)
    if (decodeCursorAuthLogoutReply(result.value) === undefined) throw new Error(t('signOutFailed'))
  }

  const discoverModels: CursorPluginCardFace['discoverModels'] = async () => {
    const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_MODELS_ENDPOINT, {})
    if (!result.ok) throw new Error(result.error.message)
    const decoded = decodeCursorModelsReply(result.value)
    if (decoded === undefined) throw new Error(t('statusFailed'))
    return decoded.models
  }

  const fetchUsage: CursorPluginCardFace['fetchUsage'] = async (refresh = false) => {
    const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_USAGE_ENDPOINT, refresh ? { refresh: true } : {})
    if (!result.ok) throw new Error(result.error.message)
    const decoded = decodeCursorUsageReply(result.value)
    if (decoded === undefined) throw new Error(t('usageFailed'))
    return decoded
  }

  const saveConfiguration: CursorPluginCardFace['saveConfiguration'] = async (settings) => {
    const snapshot = scope.getSnapshot()
    if (snapshot.revision === undefined) throw new Error(t('requestFailed'))
    const saved = await rpc.call(
      CURSOR_RPC_CHANNEL,
      CURSOR_SAVE_ENDPOINT,
      {
        models: settings.models ?? [],
        expectedRevision: snapshot.revision,
      },
    )
    if (!saved.ok) throw new Error(saved.error.message)
    const accepted = decodeCursorSaveResult(saved.value)
    if (accepted === undefined) throw new Error(t('requestFailed'))
    if (!connection.isLoopback) publishRemoteSettings(accepted.settings, accepted.revision)
    return accepted
  }

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'cursor-model-picker',
    order: 101,
    inject: (): CursorModelPickerFace => ({
      t,
      hooks: { cursorModelPicker: picker },
      closePicker: picker.close,
      togglePickerModel: picker.toggle,
      adoptPickerModels: picker.adopt,
    }),
  }, CursorModelPicker))
  ctx.slots.inject('settings.provider.item', () => ctx.slots.register({
    name: 'settings.provider.item',
    key: CURSOR_SETTINGS_NAMESPACE,
    locale: localeNamespace,
    inject: (): CursorPluginCardFace => ({
      t,
      hooks: { cursorSettings: scope },
      startAuth,
      cancelAuth,
      readAuthStatus,
      logout,
      fetchUsage,
      discoverModels,
      saveConfiguration,
      beginModelPicker: (initiallyPicked, onAdopt) => { picker.begin(onAdopt, initiallyPicked) },
      completeModelPicker: candidates => { picker.complete(candidates) },
      failModelPicker: message => { picker.fail(message) },
      closeModelPicker: picker.close,
    }),
  }, CursorPluginCard))
  // Diagnostic when the Providers UI owner is not mounted (Web without dsh-llm-providers-ui).
  // The card is registered but the page will not appear; providers still work Host-side.
  ctx.effect(() => {
    let warned = false
    const check = (): void => {
      const hasProvidersSection = ctx.slots.entries('settings.section').some(entry => entry.options.id === 'providers')
      if (!hasProvidersSection && !warned) {
        warned = true
        console.warn(`[dsh-llm-providers-ui] LLM Providers page missing for card ${"llm-cursor"}: install dsh-llm-providers-ui to show the card. Host route remains active.`)
      }
    }
    const timer = setTimeout(check, 0)
    const stop = ctx.slots.subscribe('settings.section', check)
    return () => {
      clearTimeout(timer)
      stop()
    }
  }, 'dsh-llm-providers-ui: missing owner diagnostic')

}