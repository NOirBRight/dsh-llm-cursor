/**
 * Host-only Cursor OAuth session file. Tokens never leave this module through
 * the RPC contract; the browser only sees {@link statusFromSession}.
 */

import { mkdir, readFile, rename, unlink, writeFile, chmod } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { randomBytes } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import { launchEnvironmentOf } from '@deepseek-ai/dsh-launch-environment'
import type { CursorAuthStatus } from './client-contract.ts'

/** File name under `$DSH_HOME`. Never `~/.cursor` auth files. */
export const CURSOR_SESSION_FILENAME = 'cursor-oauth.json'

/** Access and refresh material stored only on the Host. */
export interface CursorSession {
  accessToken: string
  refreshToken: string
  expiresAt: string
  email?: string
  userId?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function expandHome(path: string): string {
  if (path === '~') return homedir()
  if (path.startsWith('~/') || path.startsWith('~\\')) return join(homedir(), path.slice(2))
  return path
}

export function resolveCursorSessionPath(ctx: Context): string {
  const fromEnv = launchEnvironmentOf(ctx).get('DSH_HOME')?.value
  const home = fromEnv !== undefined && fromEnv.trim().length > 0
    ? expandHome(fromEnv.trim())
    : join(homedir(), '.dsh')
  return join(home, CURSOR_SESSION_FILENAME)
}

export function sessionPathForHome(dshHome: string): string {
  return join(dshHome, CURSOR_SESSION_FILENAME)
}

export function decodeCursorSession(value: unknown): CursorSession | undefined {
  if (!isRecord(value)) return undefined
  const accessToken = value['accessToken']
  const refreshToken = value['refreshToken']
  const expiresAt = value['expiresAt']
  const email = value['email']
  const userId = value['userId']
  if (typeof accessToken !== 'string' || accessToken.length === 0) return undefined
  if (typeof refreshToken !== 'string' || refreshToken.length === 0) return undefined
  if (typeof expiresAt !== 'string' || expiresAt.length === 0 || Number.isNaN(Date.parse(expiresAt))) {
    return undefined
  }
  if (email !== undefined && (typeof email !== 'string' || email.length === 0)) return undefined
  if (userId !== undefined && (typeof userId !== 'string' || userId.length === 0)) return undefined
  return {
    accessToken,
    refreshToken,
    expiresAt,
    ...email === undefined ? {} : { email },
    ...userId === undefined ? {} : { userId },
  }
}

export async function readSession(path: string): Promise<CursorSession | undefined> {
  try {
    const raw = await readFile(path, 'utf8')
    return decodeCursorSession(JSON.parse(raw) as unknown)
  } catch {
    return undefined
  }
}

export async function writeSession(path: string, session: CursorSession): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  const tmp = `${path}.${randomBytes(8).toString('hex')}.tmp`
  const body = `${JSON.stringify(session, null, 2)}\n`
  try {
    await writeFile(tmp, body, { encoding: 'utf8', mode: 0o600 })
    await chmod(tmp, 0o600)
    await rename(tmp, path)
    await chmod(path, 0o600)
  } catch (error) {
    await unlink(tmp).catch(() => undefined)
    throw error
  }
}

export async function deleteSession(path: string): Promise<void> {
  try {
    await unlink(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}

export function statusFromSession(session: CursorSession | undefined): CursorAuthStatus {
  if (session === undefined) return { loggedIn: false }
  return {
    loggedIn: true,
    ...session.email === undefined ? {} : { email: session.email },
    expiresAt: session.expiresAt,
  }
}
