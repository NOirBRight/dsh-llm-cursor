/** Browser half: Cursor setup inside Plugin configuration. */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import {
  CURSOR_AUTH_LOGOUT_ENDPOINT,
  CURSOR_AUTH_START_ENDPOINT,
  CURSOR_AUTH_STATUS_ENDPOINT,
  CURSOR_RPC_CHANNEL,
  CURSOR_MODELS_ENDPOINT,
  CURSOR_USAGE_ENDPOINT,
  decodeCursorAuthLogoutReply,
  decodeCursorAuthStartReply,
  decodeCursorAuthStatus,
  decodeCursorUsageReply,
  decodeCursorModelsReply,
} from '../client-contract.ts'
import { CursorPluginCard } from './CursorPluginCard.tsx'
import type { CursorPluginCardFace } from './CursorPluginCard.tsx'
import { en, zh } from './locales.ts'
import type { CursorSettingsKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    'settings.cursor': CursorSettingsKey
  }
}

export const name = 'dsh-llm-cursor-client'
export const inject = ['slots', 'locale', 'connection']

export function apply(ctx: ClientContext): void {
  const localeNamespace = 'settings.cursor'
  ctx.effect(
    () => ctx.locale.register(localeNamespace, { zh, en }),
    'dsh-llm-cursor: Plugin configuration copy',
  )
  const t = ctx.locale.bind(localeNamespace) as CursorPluginCardFace['t']
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

  const fetchModels: CursorPluginCardFace['fetchModels'] = async () => {
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

  ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
    name: 'settings.plugin.item',
    id: 'cursor',
    order: 41,
    locale: localeNamespace,
    inject: (): CursorPluginCardFace => ({
      t, startAuth, readAuthStatus, logout, fetchUsage, fetchModels,
    }),
  }, CursorPluginCard))
}
