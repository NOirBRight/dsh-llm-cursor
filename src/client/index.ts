/** Browser half: Cursor setup inside Plugin configuration. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import {
  CURSOR_AUTH_LOGOUT_ENDPOINT,
  CURSOR_AUTH_START_ENDPOINT,
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
  interface LocaleNamespaceMap {
    'settings.cursor': CursorSettingsKey
  }
}

export const name = 'dsh-llm-cursor-client'
export const inject = ['slots', 'locale', 'connection', 'settingsScope']

export function apply(ctx: ClientContext): void {
  const localeNamespace = 'settings.cursor'
  ctx.effect(
    () => ctx.locale.register(localeNamespace, { zh, en }),
    'dsh-llm-cursor: Plugin configuration copy',
  )
  const t = ctx.locale.bind(localeNamespace) as CursorPluginCardFace['t']
  const scope = ctx.settingsScope.bind<CursorSettingsView>({
    namespace: CURSOR_SETTINGS_NAMESPACE,
    decode: decodeCursorSettings,
  })
  const picker = new CursorModelPickerController()
  const { rpc } = ctx.get('connection') as unknown as ConnectionHandle

  const startAuth: CursorPluginCardFace['startAuth'] = async () => {
    const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_START_ENDPOINT, {})
    if (!result.ok) return { ok: false, retryable: true, message: result.error.message }
    const decoded = decodeCursorAuthStartReply(result.value)
    if (decoded === undefined) return { ok: false, retryable: true, message: t('signInFailed') }
    return decoded
  }

  const readAuthStatus: CursorPluginCardFace['readAuthStatus'] = async () => {
    const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_AUTH_STATUS_ENDPOINT, {})
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

  const fetchUsage: CursorPluginCardFace['fetchUsage'] = async () => {
    const result = await rpc.call(CURSOR_RPC_CHANNEL, CURSOR_USAGE_ENDPOINT, {})
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

  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    id: 'cursor',
    order: 41,
    locale: localeNamespace,
    inject: (): CursorPluginCardFace => ({
      t,
      hooks: { cursorSettings: scope },
      startAuth,
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
}
