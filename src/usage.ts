/**
 * Host-only Cursor usage reads. The browser receives a decoded window view.
 */

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
  fetch?: typeof fetch
  now?: () => number
  signal?: AbortSignal
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
    throw new Error(`Cursor usage read failed: ${String(response.status)}`)
  }
  return await response.json()
}

export async function readCursorUsage(request: CursorUsageRequest): Promise<CursorUsageReply> {
  const fetchImpl = request.fetch ?? fetch
  const now = request.now ?? Date.now
  const headers = {
    accept: 'application/json',
    ...cursorRequestHeaders(request.accessToken),
  }
  const authUsage = await readJson(fetchImpl, request.usageURL ?? CURSOR_USAGE_URL, headers, request.signal)
  const authWindows = parseCursorAuthUsage(authUsage)
  let summaryWindows: CursorUsageWindow[] = []
  if (request.userId !== undefined && request.userId.length > 0) {
    const cookie = `WorkosCursorSessionToken=${encodeURIComponent(`${request.userId}::${request.accessToken}`)}`
    const sessionHeaders = { accept: 'application/json', cookie }
    try {
      const summary = await readJson(
        fetchImpl,
        request.usageSummaryURL ?? CURSOR_USAGE_SUMMARY_URL,
        sessionHeaders,
        request.signal,
      )
      summaryWindows = parseCursorUsageSummary(summary)
    } catch {
      /* summary is optional when auth/usage already produced windows */
    }
    try {
      const me = await readJson(fetchImpl, request.authMeURL ?? CURSOR_AUTH_ME_URL, sessionHeaders, request.signal)
      const email = parseCursorAuthMeEmail(me)
      if (email !== undefined) await request.onEmail?.(email)
    } catch {
      /* email backfill is optional */
    }
  }
  // Dashboard rails win when present; do not stack leftover /auth/usage gpt-4 buckets on top.
  const windows = usefulUsageWindows(summaryWindows.length > 0 ? summaryWindows : authWindows)
  if (windows.length === 0) return { status: 'unsupported' }
  const usage: CursorUsageView = {
    fetchedAt: new Date(now()).toISOString(),
    windows,
  }
  return { status: 'ok', usage }
}
