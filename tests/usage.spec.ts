import { createServer } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'
import { parseCursorAuthMeEmail, parseCursorAuthUsage, parseCursorBillingReset, parseCursorUsageSummary, readCursorUsage } from '../src/usage.ts'

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
})
