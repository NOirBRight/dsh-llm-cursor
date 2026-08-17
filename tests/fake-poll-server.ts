import { createServer } from 'node:http'
import type { Server } from 'node:http'

const servers: Server[] = []

export async function closeFakePollServers(): Promise<void> {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => { error ? reject(error) : resolve() })
  })))
}

export async function fakePollServer(options: {
  notFoundCount?: number
  tokens?: { accessToken: string, refreshToken: string }
  refresh?: { accessToken: string, refreshToken?: string }
  refreshStatus?: number
}): Promise<{ pollURL: string, refreshURL: string, polls: number, refreshes: number }> {
  let polls = 0
  let refreshes = 0
  const notFoundCount = options.notFoundCount ?? 1
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    if (url.pathname === '/auth/poll') {
      polls++
      if (polls <= notFoundCount) {
        res.statusCode = 404
        res.end()
        return
      }
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify(options.tokens ?? {
        accessToken: 'access-one',
        refreshToken: 'refresh-one',
      }))
      return
    }
    if (url.pathname === '/auth/exchange_user_api_key') {
      refreshes++
      if (options.refreshStatus !== undefined) {
        res.statusCode = options.refreshStatus
        res.end('no')
        return
      }
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify(options.refresh ?? {
        accessToken: 'access-two',
        refreshToken: 'refresh-two',
      }))
      return
    }
    res.statusCode = 404
    res.end()
  })
  servers.push(server)
  await new Promise<void>((resolve) => { server.listen(0, '127.0.0.1', resolve) })
  const address = server.address()
  if (address === null || typeof address === 'string') throw new Error('no listen port')
  const origin = `http://127.0.0.1:${String(address.port)}`
  return {
    pollURL: `${origin}/auth/poll`,
    refreshURL: `${origin}/auth/exchange_user_api_key`,
    get polls() { return polls },
    get refreshes() { return refreshes },
  }
}
