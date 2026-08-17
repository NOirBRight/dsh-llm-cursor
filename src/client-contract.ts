/** Browser-safe constants and JSON decoders shared by the Host and client plugin faces. */

/** Settings namespace owned by the Cursor plugin. */
export const CURSOR_SETTINGS_NAMESPACE = 'llm-cursor'
/** Provider route owned by this plugin. */
export const CURSOR_PROVIDER = 'cursor'
/** Default maximum idle interval while a stream read is outstanding. */
export const CURSOR_DEFAULT_STREAM_IDLE_TIMEOUT_MS = 300_000
/** Private Connection RPC channel used by this package's Host and Web faces. */
export const CURSOR_RPC_CHANNEL = '/cursor'
/** Begin a Host-owned Deep Control sign-in. */
export const CURSOR_AUTH_START_ENDPOINT = 'auth/start'
/** Secret-free login snapshot. */
export const CURSOR_AUTH_STATUS_ENDPOINT = 'auth/status'
/** Delete the Host session file. */
export const CURSOR_AUTH_LOGOUT_ENDPOINT = 'auth/logout'
/** Secret-free subscription-usage snapshot. */
export const CURSOR_USAGE_ENDPOINT = 'usage/read'
/** Account model list. */
export const CURSOR_MODELS_ENDPOINT = 'models/list'
/** MCP / history provider identifier; must match on advertise and replay. */
export const CURSOR_MCP_PROVIDER_ID = 'dsh-llm-cursor'

/** One model in the plugin catalog. */
export interface CursorCatalogModel {
  /** Wire model id accepted by AgentService/Run. */
  id: string
  /** Selector label; omission uses {@link id}. */
  name?: string
  /** Whether the model supports native thinking. */
  thinking?: boolean
  /** Whether the model accepts image input. */
  vision?: boolean
  /** Whether requests may set maxMode. */
  maxMode?: boolean
}

/**
 * Offline fallback when the account catalog cannot be read.
 * Live ids come from GetUsableModels after sign-in.
 */
export const CURSOR_CATALOG: readonly CursorCatalogModel[] = Object.freeze([
  Object.freeze({
    id: 'composer-2.5',
    name: 'Composer 2.5',
    thinking: true,
    vision: true,
    maxMode: true,
  }),
])

/** Settings fields presented by the package's Web configuration card. No apiKeyEnv. */
export interface CursorSettingsView {
  /** Stream idle timeout in milliseconds. */
  streamIdleTimeoutMs: number
  /** Last successful catalog; empty means use {@link CURSOR_CATALOG}. */
  models?: readonly CursorCatalogModel[]
}

/** Secret-free login snapshot. */
export interface CursorAuthStatus {
  /** Whether the Host currently holds a usable session file. */
  loggedIn: boolean
  /** Account email when the session recorded one. */
  email?: string
  /** ISO-8601 access-token expiry when the session recorded one. */
  expiresAt?: string
}

export type CursorAuthStartReply =
  | { ok: true }
  | { ok: false, retryable: true, message: string }

export interface CursorAuthLogoutReply {
  ok: true
}

export interface CursorUsageWindow {
  id: string
  used: number
  limit: number
  period?: string
  unit?: 'percent'
}

export interface CursorUsageView {
  fetchedAt: string
  windows: CursorUsageWindow[]
}

export interface CursorModelsReply {
  models: CursorCatalogModel[]
}

export type CursorUsageReply =
  | { status: 'ok', usage: CursorUsageView }
  | { status: 'unsupported' }
  | { status: 'logged-out' }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const TOKEN_FIELD = /^(?:accessToken|refreshToken|access_token|refresh_token|id_token|idToken|token)$/iu

function hasTokenFields(value: Record<string, unknown>): boolean {
  return Object.keys(value).some(key => TOKEN_FIELD.test(key))
}

function optionalNonEmptyString(value: unknown): value is string | undefined {
  return value === undefined || (typeof value === 'string' && value.length > 0)
}

export function decodeCursorCatalogModel(value: unknown): CursorCatalogModel | undefined {
  if (!isRecord(value)) return undefined
  const id = value['id']
  if (typeof id !== 'string' || id.length === 0) return undefined
  const name = value['name']
  const thinking = value['thinking']
  const vision = value['vision']
  const maxMode = value['maxMode']
  if (name !== undefined && (typeof name !== 'string' || name.length === 0)) return undefined
  if (thinking !== undefined && typeof thinking !== 'boolean') return undefined
  if (vision !== undefined && typeof vision !== 'boolean') return undefined
  if (maxMode !== undefined && typeof maxMode !== 'boolean') return undefined
  return {
    id,
    ...name === undefined ? {} : { name },
    ...thinking === undefined ? {} : { thinking },
    ...vision === undefined ? {} : { vision },
    ...maxMode === undefined ? {} : { maxMode },
  }
}

export function decodeCursorSettings(value: unknown): CursorSettingsView | undefined {
  if (!isRecord(value)) return undefined
  const streamIdleTimeoutMs = value['streamIdleTimeoutMs']
  if (typeof streamIdleTimeoutMs !== 'number' || !Number.isFinite(streamIdleTimeoutMs) || streamIdleTimeoutMs <= 0) {
    return undefined
  }
  const models = value['models']
  if (models !== undefined) {
    if (!Array.isArray(models)) return undefined
    const decoded: CursorCatalogModel[] = []
    for (const entry of models) {
      const model = decodeCursorCatalogModel(entry)
      if (model === undefined) return undefined
      decoded.push(model)
    }
    return { streamIdleTimeoutMs, models: decoded }
  }
  return { streamIdleTimeoutMs }
}

export function decodeCursorEmptyRequest(value: unknown): Record<string, never> | undefined {
  if (value === undefined || value === null) return {}
  if (!isRecord(value) || hasTokenFields(value)) return undefined
  return {}
}

export function decodeCursorAuthStartReply(value: unknown): CursorAuthStartReply | undefined {
  if (!isRecord(value) || hasTokenFields(value) || typeof value['ok'] !== 'boolean') return undefined
  if (value['ok'] === true) return { ok: true }
  if (value['retryable'] !== true || typeof value['message'] !== 'string' || value['message'].length === 0) {
    return undefined
  }
  return { ok: false, retryable: true, message: value['message'] }
}

export function decodeCursorAuthStatus(value: unknown): CursorAuthStatus | undefined {
  if (!isRecord(value) || hasTokenFields(value) || typeof value['loggedIn'] !== 'boolean') return undefined
  const email = value['email']
  const expiresAt = value['expiresAt']
  if (!optionalNonEmptyString(email) || !optionalNonEmptyString(expiresAt)) return undefined
  return {
    loggedIn: value['loggedIn'],
    ...email === undefined ? {} : { email },
    ...expiresAt === undefined ? {} : { expiresAt },
  }
}

export function decodeCursorAuthLogoutReply(value: unknown): CursorAuthLogoutReply | undefined {
  if (!isRecord(value) || hasTokenFields(value) || value['ok'] !== true) return undefined
  return { ok: true }
}

export function decodeCursorUsageView(value: unknown): CursorUsageView | undefined {
  if (!isRecord(value) || hasTokenFields(value)) return undefined
  const fetchedAt = value['fetchedAt']
  const windows = value['windows']
  if (typeof fetchedAt !== 'string' || fetchedAt.length === 0) return undefined
  if (!Array.isArray(windows) || windows.length === 0) return undefined
  const decoded: CursorUsageWindow[] = []
  for (const entry of windows) {
    if (!isRecord(entry)) return undefined
    const id = entry['id']
    const used = entry['used']
    const limit = entry['limit']
    const period = entry['period']
    const unit = entry['unit']
    if (typeof id !== 'string' || id.length === 0) return undefined
    if (typeof used !== 'number' || !Number.isFinite(used) || used < 0) return undefined
    if (typeof limit !== 'number' || !Number.isFinite(limit) || limit < 0) return undefined
    if (period !== undefined && (typeof period !== 'string' || period.length === 0)) return undefined
    if (unit !== undefined && unit !== 'percent') return undefined
    decoded.push({
      id,
      used,
      limit,
      ...period === undefined ? {} : { period },
      ...unit === undefined ? {} : { unit },
    })
  }
  return { fetchedAt, windows: decoded }
}

export function decodeCursorUsageReply(value: unknown): CursorUsageReply | undefined {
  if (!isRecord(value) || hasTokenFields(value)) return undefined
  const status = value['status']
  if (status === 'logged-out' || status === 'unsupported') return { status }
  if (status !== 'ok') return undefined
  const usage = decodeCursorUsageView(value['usage'])
  if (usage === undefined) return undefined
  return { status: 'ok', usage }
}

export function decodeCursorModelsReply(value: unknown): CursorModelsReply | undefined {
  if (!isRecord(value) || hasTokenFields(value)) return undefined
  const models = value['models']
  if (!Array.isArray(models)) return undefined
  const decoded: CursorCatalogModel[] = []
  for (const entry of models) {
    const model = decodeCursorCatalogModel(entry)
    if (model === undefined) return undefined
    decoded.push(model)
  }
  return { models: decoded }
}
