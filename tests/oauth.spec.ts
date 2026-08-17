import { mkdtemp, readFile, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createCursorAuthRuntime, ensureFreshSession, startPkceLogin, extractCursorAccessTokenUserId } from '../src/oauth.ts'
import { decodeCursorSession, readSession } from '../src/session.ts'
import { closeFakePollServers, fakePollServer } from './fake-poll-server.ts'
import { jwt } from './helpers.ts'

afterEach(async () => {
  await closeFakePollServers()
})

async function home(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'dsh-llm-cursor-oauth-'))
}

describe('Host-owned Cursor Deep Control', () => {
  it('writes a 0600 session after poll 404s then success', async () => {
    const path = join(await home(), 'cursor-oauth.json')
    const accessToken = jwt({ sub: 'auth0|user-9', exp: Math.floor(Date.now() / 1000) + 3600 })
    const auth = await fakePollServer({
      notFoundCount: 2,
      tokens: { accessToken, refreshToken: 'refresh-one' },
    })
    const runtime = createCursorAuthRuntime({
      resolveSessionPath: () => path,
      pollURL: auth.pollURL,
      refreshURL: auth.refreshURL,
      pollMaxAttempts: 10,
      pollBaseDelayMs: 5,
      pollMaxDelayMs: 10,
      openBrowser: async (url) => {
        const parsed = new URL(url)
        expect(parsed.searchParams.get('mode')).toBe('login')
        expect(parsed.searchParams.get('redirectTarget')).toBe('cli')
        expect(parsed.searchParams.get('challenge')).toEqual(expect.any(String))
        expect(parsed.searchParams.get('uuid')).toEqual(expect.any(String))
      },
    })

    expect(await startPkceLogin(runtime)).toEqual({ ok: true })
    expect((await stat(path)).mode & 0o777).toBe(0o600)
    const session = decodeCursorSession(JSON.parse(await readFile(path, 'utf8')) as unknown)
    expect(session?.accessToken).toBe(accessToken)
    expect(session?.refreshToken).toBe('refresh-one')
    expect(session?.userId).toBe('user-9')
    expect(auth.polls).toBeGreaterThanOrEqual(3)
  })

  it('writes no session when poll times out', async () => {
    const path = join(await home(), 'cursor-oauth.json')
    const auth = await fakePollServer({ notFoundCount: 100 })
    const runtime = createCursorAuthRuntime({
      resolveSessionPath: () => path,
      pollURL: auth.pollURL,
      refreshURL: auth.refreshURL,
      pollMaxAttempts: 3,
      pollBaseDelayMs: 5,
      pollMaxDelayMs: 5,
      openBrowser: async () => undefined,
    })
    const reply = await startPkceLogin(runtime)
    expect(reply.ok).toBe(false)
    await expect(readFile(path, 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
  })

  it('refreshes an expiring session and clears it when refresh fails', async () => {
    const path = join(await home(), 'cursor-oauth.json')
    const expired = jwt({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) - 10 })
    const next = jwt({ sub: 'user-1', exp: Math.floor(Date.now() / 1000) + 3600 })
    const auth = await fakePollServer({ refresh: { accessToken: next, refreshToken: 'refresh-two' } })
    const { writeSession } = await import('../src/session.ts')
    await writeSession(path, {
      accessToken: expired,
      refreshToken: 'refresh-one',
      expiresAt: new Date(Date.now() - 1000).toISOString(),
      userId: 'user-1',
    })
    const runtime = createCursorAuthRuntime({
      resolveSessionPath: () => path,
      pollURL: auth.pollURL,
      refreshURL: auth.refreshURL,
    })
    const session = await ensureFreshSession(runtime)
    expect(session?.accessToken).toBe(next)
    expect(session?.refreshToken).toBe('refresh-two')

    const fail = await fakePollServer({ refreshStatus: 401 })
    const failRuntime = createCursorAuthRuntime({
      resolveSessionPath: () => path,
      pollURL: fail.pollURL,
      refreshURL: fail.refreshURL,
      now: () => Date.now() + 3600 * 1000,
    })
    expect(await ensureFreshSession(failRuntime)).toBeUndefined()
    expect(await readSession(path)).toBeUndefined()
  })

  it('parses JWT sub provider|id as the trailing user id', () => {
    expect(extractCursorAccessTokenUserId(jwt({ sub: 'auth0|abc' }))).toBe('abc')
    expect(extractCursorAccessTokenUserId(jwt({ sub: 'plain' }))).toBe('plain')
  })
})
