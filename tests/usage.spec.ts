import { createServer } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'
import { parseCursorAuthUsage, parseCursorUsageSummary, readCursorUsage } from '../src/usage.ts'

const servers: ReturnType<typeof createServer>[] = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => { error ? reject(error) : resolve() })
  })))
})

describe('Cursor usage decode', () => {
  it('keeps used when maxRequestUsage is null', () => {
    const windows = parseCursorAuthUsage({
      'gpt-4': { numRequests: 12, maxRequestUsage: null },
    })
    expect(windows).toEqual([{ id: 'gpt-4', used: 12, limit: 0 }])
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
