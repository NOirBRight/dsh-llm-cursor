/**
 * Host-owned Cursor Deep Control login (PKCE + poll).
 * Tokens stay on the Host; this module never logs Authorization headers.
 */

import { createHash, randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import type { CursorAuthStartReply } from './client-contract.ts'
import { deleteSession, readSession, writeSession } from './session.ts'
import type { CursorSession } from './session.ts'

export const CURSOR_LOGIN_URL = 'https://cursor.com/loginDeepControl'
export const CURSOR_POLL_URL = 'https://api2.cursor.sh/auth/poll'
export const CURSOR_REFRESH_URL = 'https://api2.cursor.sh/auth/exchange_user_api_key'

export const CURSOR_POLL_MAX_ATTEMPTS = 150
export const CURSOR_POLL_BASE_DELAY_MS = 1_000
export const CURSOR_POLL_MAX_DELAY_MS = 10_000
export const CURSOR_POLL_BACKOFF = 1.2
export const CURSOR_REFRESH_SKEW_MS = 5 * 60 * 1000

export interface CursorAuthParams {
  verifier: string
  challenge: string
  uuid: string
  loginUrl: string
}

export interface CursorOAuthRuntime {
  resolveSessionPath: () => string
  loginURL: string
  pollURL: string
  refreshURL: string
  openBrowser: (url: string) => Promise<void>
  fetch: typeof fetch
  now: () => number
  sleep: (ms: number) => Promise<void>
  pollMaxAttempts: number
  pollBaseDelayMs: number
  pollMaxDelayMs: number
  refreshSkewMs: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function retryable(message: string): CursorAuthStartReply {
  return { ok: false, retryable: true, message }
}

function randomUrlSafe(bytes: number): string {
  return randomBytes(bytes).toString('base64url')
}

export function generatePkce(): { verifier: string, challenge: string } {
  const verifier = randomUrlSafe(32)
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function decodeJwtPayload(token: string): Record<string, unknown> | undefined {
  const parts = token.split('.')
  const payload = parts[1]
  if (parts.length !== 3 || payload === undefined) return undefined
  try {
    const json = Buffer.from(payload, 'base64url').toString('utf8')
    const value = JSON.parse(json) as unknown
    return isRecord(value) ? value : undefined
  } catch {
    return undefined
  }
}

export function extractCursorAccessTokenUserId(accessToken: string): string | undefined {
  const payload = decodeJwtPayload(accessToken)
  const sub = payload?.['sub']
  if (typeof sub !== 'string' || sub.length === 0) return undefined
  const parts = sub.split('|')
  const userId = (parts.length > 1 ? parts[1] : sub)?.trim()
  return userId === undefined || userId.length === 0 ? undefined : userId
}

export function tokenExpiryMs(token: string, now: () => number): number {
  const payload = decodeJwtPayload(token)
  const exp = payload?.['exp']
  if (typeof exp === 'number' && Number.isFinite(exp)) return exp * 1000 - CURSOR_REFRESH_SKEW_MS
  return now() + 3600 * 1000
}

export function isCursorTokenExpiringSoon(token: string, now: () => number, skewMs = CURSOR_REFRESH_SKEW_MS): boolean {
  const payload = decodeJwtPayload(token)
  const exp = payload?.['exp']
  if (typeof exp !== 'number' || !Number.isFinite(exp)) return true
  return exp * 1000 - now() < skewMs
}

async function defaultOpenBrowser(url: string): Promise<void> {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open'
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url]
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'ignore', detached: true })
    child.on('error', reject)
    child.unref()
    resolve()
  })
}

export function createCursorAuthRuntime(overrides: Partial<CursorOAuthRuntime> & Pick<CursorOAuthRuntime, 'resolveSessionPath'>): CursorOAuthRuntime {
  return {
    loginURL: CURSOR_LOGIN_URL,
    pollURL: CURSOR_POLL_URL,
    refreshURL: CURSOR_REFRESH_URL,
    openBrowser: defaultOpenBrowser,
    fetch,
    now: () => Date.now(),
    sleep: (ms) => new Promise(resolve => { setTimeout(resolve, ms) }),
    pollMaxAttempts: CURSOR_POLL_MAX_ATTEMPTS,
    pollBaseDelayMs: CURSOR_POLL_BASE_DELAY_MS,
    pollMaxDelayMs: CURSOR_POLL_MAX_DELAY_MS,
    refreshSkewMs: CURSOR_REFRESH_SKEW_MS,
    ...overrides,
  }
}

export function generateCursorAuthParams(): CursorAuthParams {
  const { verifier, challenge } = generatePkce()
  const uuid = crypto.randomUUID()
  const params = new URLSearchParams({
    challenge,
    uuid,
    mode: 'login',
    redirectTarget: 'cli',
  })
  return {
    verifier,
    challenge,
    uuid,
    loginUrl: `${CURSOR_LOGIN_URL}?${params.toString()}`,
  }
}

export async function pollCursorAuth(
  runtime: CursorOAuthRuntime,
  uuid: string,
  verifier: string,
  signal?: AbortSignal,
): Promise<{ accessToken: string, refreshToken: string }> {
  let delay = runtime.pollBaseDelayMs
  let consecutiveErrors = 0
  for (let attempt = 0; attempt < runtime.pollMaxAttempts; attempt++) {
    if (signal?.aborted) throw new Error('Sign-in was cancelled.')
    await runtime.sleep(delay)
    if (signal?.aborted) throw new Error('Sign-in was cancelled.')
    try {
      const response = await runtime.fetch(
        `${runtime.pollURL}?uuid=${encodeURIComponent(uuid)}&verifier=${encodeURIComponent(verifier)}`,
        signal === undefined ? {} : { signal },
      )
      if (response.status === 404) {
        consecutiveErrors = 0
        delay = Math.min(delay * CURSOR_POLL_BACKOFF, runtime.pollMaxDelayMs)
        continue
      }
      if (response.ok) {
        const data = await response.json() as unknown
        if (!isRecord(data)) throw new Error('Poll returned an invalid body.')
        const accessToken = data['accessToken']
        const refreshToken = data['refreshToken']
        if (typeof accessToken !== 'string' || accessToken.length === 0) {
          throw new Error('Poll returned no access token.')
        }
        if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
          throw new Error('Poll returned no refresh token.')
        }
        return { accessToken, refreshToken }
      }
      throw new Error(`Poll failed: ${String(response.status)}`)
    } catch (error) {
      if (signal?.aborted) throw new Error('Sign-in was cancelled.')
      consecutiveErrors++
      if (consecutiveErrors >= 3) {
        throw error instanceof Error ? error : new Error('Too many consecutive errors during Cursor auth polling')
      }
    }
  }
  throw new Error('Cursor authentication polling timeout')
}

function sessionFromTokens(
  runtime: CursorOAuthRuntime,
  accessToken: string,
  refreshToken: string,
  previous?: CursorSession,
): CursorSession {
  const userId = extractCursorAccessTokenUserId(accessToken) ?? previous?.userId
  return {
    accessToken,
    refreshToken,
    expiresAt: new Date(tokenExpiryMs(accessToken, runtime.now)).toISOString(),
    ...previous?.email === undefined ? {} : { email: previous.email },
    ...userId === undefined ? {} : { userId },
  }
}

export async function refreshCursorToken(
  runtime: CursorOAuthRuntime,
  apiKeyOrRefreshToken: string,
  previous?: CursorSession,
): Promise<CursorSession> {
  const response = await runtime.fetch(runtime.refreshURL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKeyOrRefreshToken}`,
      'Content-Type': 'application/json',
    },
    body: '{}',
  })
  if (!response.ok) {
    throw new Error(`Cursor token refresh failed: ${String(response.status)}`)
  }
  const data = await response.json() as unknown
  if (!isRecord(data)) throw new Error('Cursor token refresh returned an invalid body.')
  const accessToken = data['accessToken']
  const refreshToken = data['refreshToken']
  if (typeof accessToken !== 'string' || accessToken.length === 0) {
    throw new Error('Cursor token refresh returned no access token.')
  }
  return sessionFromTokens(
    runtime,
    accessToken,
    typeof refreshToken === 'string' && refreshToken.length > 0 ? refreshToken : apiKeyOrRefreshToken,
    previous,
  )
}

export async function startPkceLogin(runtime: CursorOAuthRuntime, signal?: AbortSignal): Promise<CursorAuthStartReply> {
  const { verifier, challenge } = generatePkce()
  const uuid = crypto.randomUUID()
  const params = new URLSearchParams({
    challenge,
    uuid,
    mode: 'login',
    redirectTarget: 'cli',
  })
  const loginUrl = `${runtime.loginURL}?${params.toString()}`
  try {
    await runtime.openBrowser(loginUrl)
    const tokens = await pollCursorAuth(runtime, uuid, verifier, signal)
    await writeSession(runtime.resolveSessionPath(), sessionFromTokens(runtime, tokens.accessToken, tokens.refreshToken))
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error && error.message.length > 0
      ? error.message
      : 'Sign-in did not complete.'
    return retryable(message)
  }
}

export async function ensureFreshSession(runtime: CursorOAuthRuntime): Promise<CursorSession | undefined> {
  const path = runtime.resolveSessionPath()
  const session = await readSession(path)
  if (session === undefined) return undefined
  if (!isCursorTokenExpiringSoon(session.accessToken, runtime.now, runtime.refreshSkewMs)) return session
  try {
    const next = await refreshCursorToken(runtime, session.refreshToken, session)
    await writeSession(path, next)
    return next
  } catch {
    await deleteSession(path)
    return undefined
  }
}
