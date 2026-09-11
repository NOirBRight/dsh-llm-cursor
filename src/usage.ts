/**
 * Host-only Cursor usage reads. The browser receives a decoded window view.
 */

import { createHash } from 'node:crypto'
import { INVALID_CREDENTIAL_CODE, LlmError } from '@deepseek-ai/dsh-llm'
import type { CursorUsageReply, CursorUsageView, CursorUsageWindow } from './client-contract.ts'
import { CURSOR_API_URL } from './identity.ts'
import { cursorRequestHeaders } from './identity.ts'

export const CURSOR_USAGE_URL = `${CURSOR_API_URL}/auth/usage`
export const CURSOR_USAGE_SUMMARY_URL = 'https://cursor.com/api/usage-summary'
export const CURSOR_AUTH_ME_URL = 'https://cursor.com/api/auth/me'
export const DEFAULT_USAGE_REQUEST_TIMEOUT_MS = 15_000

export interface CursorUsageRequest {
  accessToken: string
  userId?: string
  usageURL?: string
  usageSummaryURL?: string
  authMeURL?: string
  /** Known session email avoids an unnecessary auth/me request. */
  email?: string
  fetch?: typeof fetch
  now?: () => number
  signal?: AbortSignal
  /** Explicit refresh bypasses completed short-lived cache entries. */
  refresh?: boolean
  onEmail?: (email: string) => void | Promise<void>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

/** Official dashboard "Usage limits reset on …" comes from billingCycleEnd. */
export function parseCursorBillingReset(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined
  const value = payload['billingCycleEnd']
  if (typeof value === 'string' && value.length > 0) {
    const parsed = Date.parse(value)
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : undefined
  }
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    const ms = value < 1e12 ? value * 1000 : value
    const date = new Date(ms)
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
  }
}

function roundPercent(value: number): number {
  return Math.round(value * 10) / 10
}

function windowOf(id: string, used: number, limit: number | undefined, period?: string): CursorUsageWindow {
  return {
    id,
    used,
    limit: limit === undefined ? 0 : limit,
    ...period === undefined ? {} : { period },
  }
}

/** Decode GET /auth/usage. A null maxRequestUsage still yields a used window. */
export function parseCursorAuthUsage(payload: unknown): CursorUsageWindow[] {
  if (!isRecord(payload)) return []
  const windows: CursorUsageWindow[] = []
  for (const [key, value] of Object.entries(payload)) {
    if (!isRecord(value)) continue
    const used = toNumber(value['numRequests']) ?? toNumber(value['used'])
      ?? toNumber(value['amountUsed']) ?? toNumber(value['usdUsed'])
    const limit = toNumber(value['maxRequestUsage']) ?? toNumber(value['limit'])
      ?? toNumber(value['amountLimit']) ?? toNumber(value['usdLimit'])
    if (used === undefined) continue
    windows.push(windowOf(key, used, limit))
  }
  return windows
}

/** Decode cursor.com/api/usage-summary individualUsage. */
export function parseCursorUsageSummary(payload: unknown): CursorUsageWindow[] {
  if (!isRecord(payload) || !isRecord(payload['individualUsage'])) return []
  const individual = payload['individualUsage']
  const windows: CursorUsageWindow[] = []
  const plan = isRecord(individual['plan']) ? individual['plan'] : undefined
  const overall = isRecord(individual['overall']) ? individual['overall'] : undefined
  const onDemand = isRecord(individual['onDemand']) ? individual['onDemand'] : undefined
  const auto = plan === undefined ? undefined : toNumber(plan['autoPercentUsed'])
  const api = plan === undefined ? undefined : toNumber(plan['apiPercentUsed'])
  if (auto !== undefined) windows.push({ id: 'Cursor Models', used: roundPercent(auto), limit: 100, unit: 'percent' })
  if (api !== undefined) windows.push({ id: 'Other Models', used: roundPercent(api), limit: 100, unit: 'percent' })
  if (windows.length === 0 && overall !== undefined) {
    const used = toNumber(overall['used'])
    const limit = toNumber(overall['limit'])
    if (used !== undefined) windows.push(windowOf('Personal Usage', used, limit))
  }
  if (onDemand !== undefined) {
    const used = toNumber(onDemand['used'])
    const limit = toNumber(onDemand['limit'])
    // Unused unlimited on-demand is noise; keep it only when it has spend or a cap.
    if (used !== undefined && (used > 0 || (limit !== undefined && limit > 0))) {
      windows.push(windowOf('On-Demand', used, limit))
    }
  }
  return windows
}

/** Drop leftover 0 / Unlimited request buckets (e.g. gpt-4 from /auth/usage). */
export function usefulUsageWindows(windows: readonly CursorUsageWindow[]): CursorUsageWindow[] {
  return windows.filter(window => window.unit === 'percent' || window.used > 0 || window.limit > 0)
}

export function parseCursorAuthMeEmail(payload: unknown): string | undefined {
  if (!isRecord(payload)) return undefined
  if (typeof payload['email'] === 'string' && payload['email'].length > 0) return payload['email']
  const user = payload['user']
  if (isRecord(user) && typeof user['email'] === 'string' && user['email'].length > 0) return user['email']
}

export async function readCursorAccountEmail(request: {
  accessToken: string
  userId: string
  authMeURL?: string
  fetch?: typeof fetch
  signal?: AbortSignal
}): Promise<string | undefined> {
  const fetchImpl = request.fetch ?? fetch
  const cookie = `WorkosCursorSessionToken=${encodeURIComponent(`${request.userId}::${request.accessToken}`)}`
  try {
    const payload = await readJson(
      fetchImpl,
      request.authMeURL ?? CURSOR_AUTH_ME_URL,
      { accept: 'application/json', cookie },
      request.signal,
    )
    return parseCursorAuthMeEmail(payload)
  } catch {
    return undefined
  }
}

async function readJson(
  fetchImpl: typeof fetch,
  url: string,
  headers: Record<string, string>,
  signal: AbortSignal | undefined,
): Promise<unknown> {
  const response = await fetchImpl(url, {
    headers,
    redirect: 'error',
    ...signal === undefined ? {} : { signal },
  })
  if (!response.ok) {
    await response.body?.cancel()
    // A refused credential is a credential verdict, not a read failure: the
    // browser drops its cached quota on this code instead of keeping it.
    if (response.status === 401 || response.status === 403) {
      throw new LlmError(`Cursor usage read failed: ${String(response.status)}`, INVALID_CREDENTIAL_CODE)
    }
    throw new Error(`Cursor usage read failed: ${String(response.status)}`)
  }
  return await response.json()
}

const USAGE_CACHE_MS = 5_000
const OPTIONAL_404_CACHE_MS = 7 * 60_000
export const OPTIONAL_USAGE_REQUEST_TIMEOUT_MS = 3_000
const usageCache = new Map<string, { expiresAt: number, reply: CursorUsageReply }>()
const usageInFlight = new Map<string, Promise<CursorUsageReply>>()
const optional404Until = new Map<string, number>()

function usageCacheKey(request: CursorUsageRequest): string {
  const tokenKey = createHash('sha256').update(request.accessToken).digest('hex')
  return [tokenKey, request.userId ?? '', request.usageURL ?? CURSOR_USAGE_URL, request.usageSummaryURL ?? CURSOR_USAGE_SUMMARY_URL, request.authMeURL ?? CURSOR_AUTH_ME_URL].join('\u0000')
}

async function readWithTimeout(fetchImpl: typeof fetch, url: string, headers: Record<string, string>, parent: AbortSignal | undefined, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController()
  const abort = () => { controller.abort() }
  parent?.addEventListener('abort', abort, { once: true })
  const timer = setTimeout(abort, timeoutMs)
  try { return await readJson(fetchImpl, url, headers, controller.signal) }
  finally { clearTimeout(timer); parent?.removeEventListener('abort', abort) }
}

export async function readCursorUsage(request: CursorUsageRequest): Promise<CursorUsageReply> {
  const clock = request.now ?? Date.now
  const key = usageCacheKey(request)
  const cached = usageCache.get(key)
  if (!request.refresh && cached !== undefined && cached.expiresAt > clock()) return cached.reply
  const existing = usageInFlight.get(key)
  if (existing !== undefined) return existing
  const work = readCursorUsageUncached(request, key)
  usageInFlight.set(key, work)
  try { return await work } finally { if (usageInFlight.get(key) === work) usageInFlight.delete(key) }
}

async function readOptional(fetchImpl: typeof fetch, url: string, headers: Record<string, string>, parent: AbortSignal | undefined, key: string, now: () => number): Promise<unknown> {
  const until = optional404Until.get(key)
  if (until !== undefined && until > now()) return undefined
  try { return await readWithTimeout(fetchImpl, url, headers, parent, OPTIONAL_USAGE_REQUEST_TIMEOUT_MS) }
  catch (error) {
    if (error instanceof Error && /404/u.test(error.message)) optional404Until.set(key, now() + OPTIONAL_404_CACHE_MS)
    return undefined
  }
}

async function readCursorUsageUncached(request: CursorUsageRequest, cacheKey: string): Promise<CursorUsageReply> {
  const fetchImpl = request.fetch ?? fetch
  const now = request.now ?? Date.now
  const headers = { accept: 'application/json', ...cursorRequestHeaders(request.accessToken) }
  const cookie = request.userId === undefined ? undefined : 'WorkosCursorSessionToken=' + encodeURIComponent(request.userId + '::' + request.accessToken)
  const sessionHeaders = { accept: 'application/json', ...cookie === undefined ? {} : { cookie } }
  const authPromise = readWithTimeout(fetchImpl, request.usageURL ?? CURSOR_USAGE_URL, headers, request.signal, DEFAULT_USAGE_REQUEST_TIMEOUT_MS)
  const optionalKey = cacheKey + '\u0000optional'
  let summary: unknown
  const summaryPromise = request.userId === undefined || request.userId.length === 0
    ? Promise.resolve(undefined)
    : readOptional(fetchImpl, request.usageSummaryURL ?? CURSOR_USAGE_SUMMARY_URL, sessionHeaders, request.signal, optionalKey + '\u0000summary', now)
  const mePromise = request.userId === undefined || request.userId.length === 0 || request.email !== undefined
    ? Promise.resolve(undefined)
    : readOptional(fetchImpl, request.authMeURL ?? CURSOR_AUTH_ME_URL, sessionHeaders, request.signal, optionalKey + '\u0000me', now)
  void summaryPromise.then(value => { summary = value })
  void mePromise.then(async value => {
    const email = parseCursorAuthMeEmail(value)
    if (email !== undefined) await request.onEmail?.(email)
  })
  const authUsage = await authPromise
  const authWindows = usefulUsageWindows(parseCursorAuthUsage(authUsage))
  if (authWindows.length === 0) summary = await summaryPromise
  else await Promise.resolve()
  const summaryWindows = summary === undefined ? [] : parseCursorUsageSummary(summary)
  const resetsAt = summary === undefined ? undefined : parseCursorBillingReset(summary)
  const windows = usefulUsageWindows(summaryWindows.length > 0 ? summaryWindows : authWindows)
  if (windows.length === 0) {
    const reply: CursorUsageReply = { status: 'unsupported' }
    usageCache.set(cacheKey, { expiresAt: now() + OPTIONAL_404_CACHE_MS, reply })
    return reply
  }
  const usage: CursorUsageView = { fetchedAt: new Date(now()).toISOString(), windows, ...resetsAt === undefined ? {} : { resetsAt } }
  const reply: CursorUsageReply = { status: 'ok', usage }
  usageCache.set(cacheKey, { expiresAt: now() + USAGE_CACHE_MS, reply })
  return reply
}
