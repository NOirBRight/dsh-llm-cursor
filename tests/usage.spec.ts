import { createServer } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { OPTIONAL_USAGE_REQUEST_TIMEOUT_MS, parseCursorAuthMeEmail, parseCursorAuthUsage, parseCursorBillingReset, parseCursorUsageSummary, readCursorUsage } from '../src/usage.ts'

const servers: ReturnType<typeof createServer>[] = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => { error ? reject(error) : resolve() })
  })))
})

describe('Cursor usage decode', () => {
  it('reads email from auth/me payloads', () => {
    expect(parseCursorAuthMeEmail({ email: 'a@b.test' })).toBe('a@b.test')
    expect(parseCursorAuthMeEmail({ user: { email: 'nested@b.test' } })).toBe('nested@b.test')
    expect(parseCursorAuthMeEmail({})).toBeUndefined()
  })
  it('keeps used when maxRequestUsage is null', () => {
    const windows = parseCursorAuthUsage({
      'gpt-4': { numRequests: 12, maxRequestUsage: null },
    })
    expect(windows).toEqual([{ id: 'gpt-4', used: 12, limit: 0 }])
  })

  it('reads billingCycleEnd as the official reset instant', () => {
    expect(parseCursorBillingReset({
      billingCycleEnd: '2026-09-16T04:48:49.000Z',
    })).toBe('2026-09-16T04:48:49.000Z')
    expect(parseCursorBillingReset({
      billingCycleEnd: Date.parse('2026-09-16T04:48:49.000Z'),
    })).toBe('2026-09-16T04:48:49.000Z')
    expect(parseCursorBillingReset({})).toBeUndefined()
  })

  it('reads Cursor Models / Other Models / On-Demand from usage-summary', () => {
    const windows = parseCursorUsageSummary({
      individualUsage: {
        plan: { autoPercentUsed: 20, apiPercentUsed: 5 },
        onDemand: { used: 100, limit: 500 },
      },
    })
    expect(windows).toEqual([
      { id: 'Cursor Models', used: 20, limit: 100, unit: 'percent' },
      { id: 'Other Models', used: 5, limit: 100, unit: 'percent' },
      { id: 'On-Demand', used: 100, limit: 500 },
    ])
  })

  it('drops unused unlimited On-Demand', () => {
    const windows = parseCursorUsageSummary({
      individualUsage: {
        plan: { autoPercentUsed: 1.3684999999999998, apiPercentUsed: 0 },
        onDemand: { used: 0, limit: 0 },
      },
    })
    expect(windows).toEqual([
      { id: 'Cursor Models', used: 1.4, limit: 100, unit: 'percent' },
      { id: 'Other Models', used: 0, limit: 100, unit: 'percent' },
    ])
  })

  it('prefers usage-summary rails over leftover /auth/usage buckets', async () => {
    const server = createServer((req, res) => {
      res.setHeader('content-type', 'application/json')
      if (req.url === '/auth/usage') {
        res.end(JSON.stringify({ 'gpt-4': { numRequests: 0, maxRequestUsage: null } }))
        return
      }
      if (req.url === '/usage-summary') {
        res.end(JSON.stringify({
          billingCycleEnd: '2026-09-16T04:48:49.000Z',
          individualUsage: {
            plan: { autoPercentUsed: 1.3684999999999998, apiPercentUsed: 0 },
            onDemand: { used: 0, limit: 0 },
          },
        }))
        return
      }
      res.end('{}')
    })
    servers.push(server)
    await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve) })
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('no port')
    const origin = `http://127.0.0.1:${String(address.port)}`
    const reply = await readCursorUsage({
      accessToken: 'tok',
      userId: 'user-1',
      email: 'known@example.test',
      usageURL: `${origin}/auth/usage`,
      usageSummaryURL: `${origin}/usage-summary`,
      authMeURL: `${origin}/auth/me`,
    })
    expect(reply).toEqual({
      status: 'ok',
      usage: {
        fetchedAt: expect.any(String),
        windows: [
          { id: 'Cursor Models', used: 1.4, limit: 100, unit: 'percent' },
          { id: 'Other Models', used: 0, limit: 100, unit: 'percent' },
        ],
        resetsAt: '2026-09-16T04:48:49.000Z',
      },
    })
  })

  it('returns unsupported when no windows exist', async () => {
    const server = createServer((_req, res) => {
      res.setHeader('content-type', 'application/json')
      res.end('{}')
    })
    servers.push(server)
    await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve) })
    const address = server.address()
    if (address === null || typeof address === 'string') throw new Error('no port')
    const reply = await readCursorUsage({
      accessToken: 'tok',
      usageURL: `http://127.0.0.1:${String(address.port)}/auth/usage`,
    })
    expect(reply).toEqual({ status: 'unsupported' })
  })

  it('starts usage, summary, and missing-email reads concurrently', async () => {
    const pending = new Map<string, (response: Response) => void>()
    const fetchImpl = vi.fn((input: string | URL | Request) => new Promise<Response>(resolve => {
      pending.set(String(input), resolve)
    })) as unknown as typeof fetch
    const request = readCursorUsage({
      accessToken: 'parallel-token',
      userId: 'parallel-user',
      usageURL: 'https://parallel.test/auth/usage',
      usageSummaryURL: 'https://parallel.test/usage-summary',
      authMeURL: 'https://parallel.test/auth/me',
      fetch: fetchImpl,
      refresh: true,
    })

    await vi.waitFor(() => { expect(fetchImpl).toHaveBeenCalledTimes(3) })
    pending.get('https://parallel.test/auth/usage')?.(Response.json({ model: { numRequests: 1, maxRequestUsage: 10 } }))
    pending.get('https://parallel.test/usage-summary')?.(Response.json({ individualUsage: { plan: { autoPercentUsed: 25 } } }))
    pending.get('https://parallel.test/auth/me')?.(Response.json({ email: 'parallel@example.test' }))

    await expect(request).resolves.toMatchObject({
      status: 'ok',
      usage: { windows: [{ id: 'model', used: 1, limit: 10 }] },
    })
  })

  it('skips auth/me when the session already has an email', async () => {
    const urls: string[] = []
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)
      urls.push(url)
      if (url.endsWith('/usage-summary')) return Response.json({ individualUsage: { plan: { autoPercentUsed: 5 } } })
      if (url.endsWith('/auth/me')) throw new Error('auth/me must not be called')
      return Response.json({ model: { numRequests: 1, maxRequestUsage: 10 } })
    }) as unknown as typeof fetch

    await readCursorUsage({
      accessToken: 'known-email-token',
      userId: 'known-email-user',
      email: 'known@example.test',
      usageURL: 'https://known.test/auth/usage',
      usageSummaryURL: 'https://known.test/usage-summary',
      authMeURL: 'https://known.test/auth/me',
      fetch: fetchImpl,
      refresh: true,
    })
    expect(urls).not.toContain('https://known.test/auth/me')
  })

  it('suppresses an optional 404 until the capability memory expires', async () => {
    let now = 1_000
    let summaryCalls = 0
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      const url = String(input)
      if (url.endsWith('/usage-summary')) { summaryCalls += 1; return new Response(null, { status: 404 }) }
      return Response.json({ model: { numRequests: 1, maxRequestUsage: 10 } })
    }) as unknown as typeof fetch
    const base = {
      accessToken: '404-memory-token',
      userId: '404-memory-user',
      email: 'known@example.test',
      usageURL: 'https://memory.test/auth/usage',
      usageSummaryURL: 'https://memory.test/usage-summary',
      fetch: fetchImpl,
      refresh: true,
      now: () => now,
    }

    await readCursorUsage(base)
    await readCursorUsage(base)
    expect(summaryCalls).toBe(1)
    now += 7 * 60_000 + 1
    await readCursorUsage(base)
    expect(summaryCalls).toBe(2)
  })

  it('returns primary usage when an optional endpoint reaches its timeout', async () => {
    vi.useFakeTimers()
    try {
      const fetchImpl = vi.fn((input: string | URL | Request, init?: RequestInit) => {
        const url = String(input)
        if (url.endsWith('/auth/usage')) return Promise.resolve(Response.json({ model: { numRequests: 3, maxRequestUsage: 10 } }))
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => { reject(new DOMException('aborted', 'AbortError')) }, { once: true })
        })
      }) as unknown as typeof fetch
      const pending = readCursorUsage({
        accessToken: 'timeout-token',
        userId: 'timeout-user',
        email: 'known@example.test',
        usageURL: 'https://timeout.test/auth/usage',
        usageSummaryURL: 'https://timeout.test/usage-summary',
        fetch: fetchImpl,
        refresh: true,
      })
      await vi.advanceTimersByTimeAsync(OPTIONAL_USAGE_REQUEST_TIMEOUT_MS)
      await expect(pending).resolves.toMatchObject({
        status: 'ok',
        usage: { windows: [{ id: 'model', used: 3, limit: 10 }] },
      })
    } finally {
      vi.useRealTimers()
    }
  })

  it('folds concurrent explicit refreshes into one provider request', async () => {
    let resolveUsage: ((response: Response) => void) | undefined
    const fetchImpl = vi.fn(() => new Promise<Response>(resolve => { resolveUsage = resolve })) as unknown as typeof fetch
    const request = {
      accessToken: 'fold-token',
      usageURL: 'https://fold.test/auth/usage',
      fetch: fetchImpl,
      refresh: true,
    }
    const first = readCursorUsage(request)
    const second = readCursorUsage(request)
    await vi.waitFor(() => { expect(fetchImpl).toHaveBeenCalledTimes(1) })
    resolveUsage?.(Response.json({ model: { numRequests: 2, maxRequestUsage: 10 } }))
    const [left, right] = await Promise.all([first, second])
    expect(left).toEqual(right)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
