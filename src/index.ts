/**
 * Register the `cursor` provider, the AgentService chat adapter,
 * the `llm-cursor` settings section, and the loopback `/cursor` RPC.
 * @module dsh-llm-cursor
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-client-connection'
import type { ConnectionRpcHandler } from '@deepseek-ai/dsh-client-connection'
import { resolveRetryPolicy, RetryPolicySchema } from '@deepseek-ai/dsh-llm'
import type { RetryPolicyConfig } from '@deepseek-ai/dsh-llm'
import { deepEqualJson, installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import { MAX_TIMER_DELAY_MS } from '@deepseek-ai/dsh-timeout'
import { CursorAdapter, resolveCursorAccessToken } from './adapter.ts'
import type { CursorConnectionOptions } from './adapter.ts'
import {
  CURSOR_AUTH_LOGOUT_ENDPOINT,
  CURSOR_AUTH_START_ENDPOINT,
  CURSOR_AUTH_STATUS_ENDPOINT,
  CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS,
  CURSOR_MODELS_ENDPOINT,
  CURSOR_PROVIDER,
  CURSOR_RPC_CHANNEL,
  CURSOR_SETTINGS_NAMESPACE,
  CURSOR_USAGE_ENDPOINT,
  decodeCursorEmptyRequest,
} from './client-contract.ts'
import type { CursorCatalogModel } from './client-contract.ts'
import { catalogFromSettings, fallbackCursorCatalog, readCursorModels } from './catalog.ts'
import { CURSOR_API_URL } from './identity.ts'
import { createCursorAuthRuntime, ensureFreshSession, startPkceLogin } from './oauth.ts'
import type { CursorOAuthRuntime } from './oauth.ts'
import { DEFAULT_HEARTBEAT_INTERVAL_MS } from './run.ts'
import { deleteSession, resolveCursorSessionPath, statusFromSession } from './session.ts'
import { readCursorUsage } from './usage.ts'

export { CursorAdapter, resolveCursorAccessToken, defaultCursorConnection } from './adapter.ts'
export type { CursorAdapterOptions, CursorConnectionOptions } from './adapter.ts'
export {
  CURSOR_CATALOG,
  CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS,
  CURSOR_PROVIDER,
  CURSOR_SETTINGS_NAMESPACE,
  CURSOR_RPC_CHANNEL,
  CURSOR_AUTH_START_ENDPOINT,
  CURSOR_AUTH_STATUS_ENDPOINT,
  CURSOR_AUTH_LOGOUT_ENDPOINT,
  CURSOR_MODELS_ENDPOINT,
  CURSOR_USAGE_ENDPOINT,
  CURSOR_MCP_PROVIDER_ID,
  decodeCursorSettings,
  decodeCursorAuthStatus,
  decodeCursorAuthStartReply,
  decodeCursorAuthLogoutReply,
  decodeCursorEmptyRequest,
  decodeCursorUsageView,
  decodeCursorUsageReply,
  decodeCursorModelsReply,
} from './client-contract.ts'
export type {
  CursorCatalogModel,
  CursorSettingsView,
  CursorAuthStatus,
  CursorAuthStartReply,
  CursorAuthLogoutReply,
  CursorUsageWindow,
  CursorUsageView,
  CursorUsageReply,
  CursorModelsReply,
} from './client-contract.ts'
export {
  CURSOR_LOGIN_URL,
  CURSOR_POLL_URL,
  CURSOR_REFRESH_URL,
  createCursorAuthRuntime,
  ensureFreshSession,
  startPkceLogin,
  refreshCursorToken,
} from './oauth.ts'
export type { CursorOAuthRuntime } from './oauth.ts'
export {
  CURSOR_SESSION_FILENAME,
  resolveCursorSessionPath,
  sessionPathForHome,
  readSession,
  writeSession,
  deleteSession,
  statusFromSession,
} from './session.ts'
export type { CursorSession } from './session.ts'
export { CURSOR_API_URL, CURSOR_CLIENT_VERSION, CURSOR_PLUGIN_IDENTITY_HEADER } from './identity.ts'
export { readCursorModels, fallbackCursorCatalog, catalogFromSettings } from './catalog.ts'
export { readCursorUsage, parseCursorAuthUsage, parseCursorUsageSummary } from './usage.ts'
export { DEFAULT_HEARTBEAT_INTERVAL_MS } from './run.ts'

export const name = 'llm-cursor'
export const inject = ['llm']

const NS = settingsNamespace(CURSOR_SETTINGS_NAMESPACE)

export type ResolvedCursorOptions = CursorConnectionOptions

export function resolveAdapterOptions(config: Config): ResolvedCursorOptions {
  const streamIdleTimeoutMs = config.streamIdleTimeoutMs ?? CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS
  if (!Number.isFinite(streamIdleTimeoutMs)
    || streamIdleTimeoutMs <= 0
    || streamIdleTimeoutMs > MAX_TIMER_DELAY_MS) {
    throw new Error(
      `llm-cursor: streamIdleTimeoutMs must be a positive finite number no greater than ${MAX_TIMER_DELAY_MS}`,
    )
  }
  return {
    apiURL: CURSOR_API_URL,
    models: catalogFromSettings(config.models),
    streamIdleTimeoutMs,
    heartbeatIntervalMs: DEFAULT_HEARTBEAT_INTERVAL_MS,
    retryPolicy: resolveRetryPolicy(config.retryPolicy, 'llm-cursor: retryPolicy'),
  }
}

export interface Config {
  streamIdleTimeoutMs?: number
  retryPolicy?: RetryPolicyConfig
  models?: CursorCatalogModel[]
}

export const Config: z<Config> = z.object({
  streamIdleTimeoutMs: z.number().min(Number.MIN_VALUE).max(MAX_TIMER_DELAY_MS).default(
    CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS,
  ),
  retryPolicy: RetryPolicySchema,
  models: z.any().default(undefined),
})

function internalError(message: string) {
  return {
    ok: false as const,
    error: {
      code: 'internal' as const,
      message,
      details: {},
    },
  }
}

export interface CursorRpcHandlerOptions {
  apiURL?: string
  usageURL?: string
  usageSummaryURL?: string
  authMeURL?: string
  adoptCatalog?: (models: readonly CursorCatalogModel[]) => void
}

function usageFailure(error: unknown, secrets: readonly string[]) {
  let message = error instanceof Error && error.message.length > 0
    ? error.message
    : 'Cursor usage read failed'
  for (const secret of secrets) {
    if (secret.length === 0) continue
    message = message.split(secret).join('[redacted]')
  }
  return internalError(message)
}

export function createCursorRpcHandler(
  runtime: CursorOAuthRuntime,
  options?: CursorRpcHandlerOptions,
): ConnectionRpcHandler {
  return async (endpoint, payload, signal) => {
    if (endpoint === CURSOR_AUTH_START_ENDPOINT) {
      if (decodeCursorEmptyRequest(payload) === undefined) return internalError('invalid Cursor auth start request')
      return { ok: true as const, value: await startPkceLogin(runtime, signal) }
    }
    if (endpoint === CURSOR_AUTH_STATUS_ENDPOINT) {
      if (decodeCursorEmptyRequest(payload) === undefined) return internalError('invalid Cursor auth status request')
      const session = await ensureFreshSession(runtime)
      return { ok: true as const, value: statusFromSession(session) }
    }
    if (endpoint === CURSOR_AUTH_LOGOUT_ENDPOINT) {
      if (decodeCursorEmptyRequest(payload) === undefined) return internalError('invalid Cursor auth logout request')
      await deleteSession(runtime.resolveSessionPath())
      return { ok: true as const, value: { ok: true as const } }
    }
    if (endpoint === CURSOR_MODELS_ENDPOINT) {
      if (decodeCursorEmptyRequest(payload) === undefined) return internalError('invalid Cursor models request')
      const session = await ensureFreshSession(runtime)
      if (session === undefined) return { ok: true as const, value: { models: fallbackCursorCatalog() } }
      const models = await readCursorModels({
        accessToken: session.accessToken,
        ...options?.apiURL === undefined ? {} : { apiURL: options.apiURL },
        signal,
      }) ?? fallbackCursorCatalog()
      options?.adoptCatalog?.(models)
      return { ok: true as const, value: { models } }
    }
    if (endpoint === CURSOR_USAGE_ENDPOINT) {
      if (decodeCursorEmptyRequest(payload) === undefined) return internalError('invalid Cursor usage request')
      const session = await ensureFreshSession(runtime)
      if (session === undefined) return { ok: true as const, value: { status: 'logged-out' as const } }
      try {
        const value = await readCursorUsage({
          accessToken: session.accessToken,
          ...session.userId === undefined ? {} : { userId: session.userId },
          ...options?.usageURL === undefined ? {} : { usageURL: options.usageURL },
          ...options?.usageSummaryURL === undefined ? {} : { usageSummaryURL: options.usageSummaryURL },
          ...options?.authMeURL === undefined ? {} : { authMeURL: options.authMeURL },
          fetch: runtime.fetch,
          now: runtime.now,
          signal,
        })
        return { ok: true as const, value }
      } catch (error: unknown) {
        return usageFailure(error, [session.accessToken, session.refreshToken])
      }
    }
    return internalError(`unknown Cursor endpoint: ${endpoint}`)
  }
}

export function apply(ctx: Context, config: Config): void {
  let current: () => Config = () => config
  let lastRaw: Config | undefined
  let lastGood: ResolvedCursorOptions | undefined
  let catalog: readonly CursorCatalogModel[] = catalogFromSettings(config.models)
  const options = (): ResolvedCursorOptions => {
    const raw = current()
    if (raw === lastRaw && lastGood !== undefined && lastGood.models === catalog) return lastGood
    try {
      const next = { ...resolveAdapterOptions(raw), models: catalog }
      lastRaw = raw
      lastGood = next
      return next
    } catch (error) {
      if (lastGood === undefined) throw error
      lastRaw = raw
      ctx.logger.error('llm-cursor: keeping the last good configuration after an invalid settings section')
      ctx.logger.error(error)
      return lastGood
    }
  }
  options()

  const runtime = createCursorAuthRuntime({
    resolveSessionPath: () => resolveCursorSessionPath(ctx),
  })
  const adoptCatalog = (models: readonly CursorCatalogModel[]): void => {
    catalog = models
  }
  const refreshCatalog = async (): Promise<void> => {
    const session = await ensureFreshSession(runtime)
    if (session === undefined) return
    const models = await readCursorModels({
      accessToken: session.accessToken,
    })
    if (models !== undefined) catalog = models
  }
  const adapter = new CursorAdapter({
    options,
    resolveApiKey: () => resolveCursorAccessToken(runtime),
    resolveAttachments: () => ctx.get('attachments'),
    refreshCatalog,
  })
  ctx.llm.registerConfigurableProviders([
    { provider: CURSOR_PROVIDER, displayName: 'Cursor', settingsNs: NS, settingsPath: [] },
  ])
  const registration = ctx.llm.registerAdapter([CURSOR_PROVIDER], adapter)
  let registeredPolicy = options().retryPolicy
  const ensureRegistrationFacts = (): void => {
    const policy = options().retryPolicy
    if (deepEqualJson(policy, registeredPolicy)) return
    registration.replace([CURSOR_PROVIDER])
    registeredPolicy = policy
  }

  ctx.inject(['connection'], (connectionCtx) => {
    connectionCtx.connection.rpc.handle(
      CURSOR_RPC_CHANNEL,
      createCursorRpcHandler(runtime, { adoptCatalog }),
      { authority: 'loopback' },
    )
  })

  installSettingsSection(ctx, NS, Config, config, {
    setSource: (source) => {
      current = source
    },
    onChange: ensureRegistrationFacts,
  })
}
