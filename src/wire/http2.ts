/**
 * HTTP/2 Connect+proto client for AgentService.
 */

import { connect, constants } from 'node:http2'
import type { ClientHttp2Session, ClientHttp2Stream, IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http2'
import { LlmError } from '@deepseek-ai/dsh-llm'
import { CONNECT_END_STREAM_FLAG, CursorWireError, frameConnectMessage, parseConnectEndStream, takeConnectFrames } from './connect.ts'

export const RUN_PATH = '/agent.v1.AgentService/Run'

export interface ConnectStream {
  session: ClientHttp2Session
  stream: ClientHttp2Stream
  trailers: Record<string, string>
  getHttpStatus: () => number
  push: (chunk: Buffer) => void
  waitChunk: () => Promise<Buffer | undefined>
}

function headerRecord(headers: IncomingHttpHeaders): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === 'string') out[key] = value
    else if (Array.isArray(value) && value[0] !== undefined) out[key] = value[0]
  }
  return out
}

function transportError(error: unknown): LlmError {
  const message = error instanceof Error && error.message.length > 0
    ? error.message
    : 'HTTP/2 connection failed'
  return new LlmError(
    `llm-cursor: HTTP/2 to the Cursor session entry failed (${message}). The chat path requires HTTP/2 to api2.cursor.sh.`,
    'TRANSPORT',
  )
}

export function openConnectSession(origin: string): ClientHttp2Session {
  try {
    return connect(origin)
  } catch (error) {
    throw transportError(error)
  }
}

function requestHeaders(path: string, extra: Record<string, string>): OutgoingHttpHeaders {
  return {
    ':method': 'POST',
    ':path': path,
    'content-type': 'application/connect+proto',
    'connect-protocol-version': '1',
    ...extra,
  }
}

export function attachConnectReader(stream: ClientHttp2Stream): {
  trailers: Record<string, string>
  getHttpStatus: () => number
  push: (chunk: Buffer) => void
  waitChunk: () => Promise<Buffer | undefined>
} {
  const trailers: Record<string, string> = {}
  const queue: Buffer[] = []
  const waiters: Array<{
    resolve: (chunk: Buffer | undefined) => void
    reject: (error: LlmError) => void
  }> = []
  let ended = false
  let failure: LlmError | undefined
  let httpStatus = 0

  const push = (chunk: Buffer): void => {
    const waiter = waiters.shift()
    if (waiter !== undefined) waiter.resolve(chunk)
    else queue.push(chunk)
  }
  const finish = (error?: unknown): void => {
    ended = true
    if (error !== undefined) failure = transportError(error)
    while (waiters.length > 0) {
      const waiter = waiters.shift()
      if (waiter === undefined) continue
      if (failure !== undefined) waiter.reject(failure)
      else waiter.resolve(undefined)
    }
  }

  stream.on('response', (headers) => {
    httpStatus = Number(headers[':status'] ?? 0)
  })
  stream.on('data', (chunk: Buffer) => { push(chunk) })
  stream.on('trailers', (headers) => { Object.assign(trailers, headerRecord(headers)) })
  stream.on('end', () => { finish() })
  stream.on('close', () => { finish() })
  stream.on('error', (error) => { finish(error) })

  return {
    trailers,
    getHttpStatus: () => httpStatus,
    push,
    waitChunk: () => {
      if (queue.length > 0) return Promise.resolve(queue.shift())
      if (failure !== undefined) return Promise.reject(failure)
      if (ended) return Promise.resolve(undefined)
      return new Promise((resolve, reject) => { waiters.push({ resolve, reject }) })
    },
  }
}

export function openConnectStream(
  origin: string,
  path: string,
  headers: Record<string, string>,
): ConnectStream {
  const session = openConnectSession(origin)
  const stream = session.request(requestHeaders(path, headers))
  const reader = attachConnectReader(stream)
  session.on('error', () => { /* surface on stream */ })
  return { session, stream, ...reader }
}

export async function readConnectPayloads(
  waitChunk: () => Promise<Buffer | undefined>,
  onFrame: (payload: Uint8Array) => void,
): Promise<void> {
  let rest = Buffer.alloc(0)
  for (;;) {
    const chunk = await waitChunk()
    if (chunk === undefined) break
    rest = Buffer.concat([rest, chunk])
    const taken = takeConnectFrames(rest)
    rest = Buffer.from(taken.rest)
    for (const frame of taken.frames) {
      if ((frame.flags & CONNECT_END_STREAM_FLAG) !== 0) {
        const error = parseConnectEndStream(frame.payload)
        if (error !== null) throw error
        continue
      }
      onFrame(frame.payload)
    }
  }
}

/**
 * Unary HTTP/2 call using raw protobuf (`application/proto`).
 * GetUsableModels rejects Connect (`application/connect+proto`) with 415.
 */
export async function connectUnaryProto(options: {
  origin: string
  path: string
  headers: Record<string, string>
  body: Uint8Array
  signal?: AbortSignal
}): Promise<Uint8Array> {
  const session = openConnectSession(options.origin)
  const stream = session.request({
    ':method': 'POST',
    ':path': options.path,
    'content-type': 'application/proto',
    te: 'trailers',
    ...options.headers,
  })
  const onAbort = (): void => {
    try { stream.close(constants.NGHTTP2_CANCEL) } catch { /* closed */ }
    try { session.close() } catch { /* closed */ }
  }
  options.signal?.addEventListener('abort', onAbort, { once: true })
  try {
    const chunks: Buffer[] = []
    let status = 0
    const done = new Promise<Buffer>((resolve, reject) => {
      stream.on('response', (headers) => {
        status = Number(headers[':status'] ?? 0)
      })
      stream.on('data', (chunk: Buffer) => { chunks.push(chunk) })
      stream.on('end', () => { resolve(Buffer.concat(chunks)) })
      stream.on('error', reject)
    })
    stream.end(Buffer.from(options.body))
    const payload = await done
    if (status < 200 || status >= 300) {
      throw new Error(`Cursor model catalog returned HTTP ${String(status)}`)
    }
    if (payload.length === 0) throw new Error('Empty protobuf unary response')
    return payload
  } catch (error) {
    if (error instanceof LlmError) throw error
    if (error instanceof Error && error.message.startsWith('Cursor model catalog')) throw error
    throw transportError(error)
  } finally {
    options.signal?.removeEventListener('abort', onAbort)
    try { session.close() } catch { /* closed */ }
  }
}

export async function connectUnary(options: {
  origin: string
  path: string
  headers: Record<string, string>
  body: Uint8Array
  signal?: AbortSignal
}): Promise<Uint8Array> {
  const opened = openConnectStream(options.origin, options.path, options.headers)
  const onAbort = (): void => {
    try { opened.stream.close(constants.NGHTTP2_CANCEL) } catch { /* closed */ }
    try { opened.session.close() } catch { /* closed */ }
  }
  options.signal?.addEventListener('abort', onAbort, { once: true })
  try {
    opened.stream.end(frameConnectMessage(options.body))
    let payload: Uint8Array | undefined
    await readConnectPayloads(opened.waitChunk, (frame) => {
      payload = frame
    })
    if (payload === undefined) throw new Error('Empty Connect unary response')
    return payload
  } catch (error) {
    if (error instanceof LlmError) throw error
    throw transportError(error)
  } finally {
    options.signal?.removeEventListener('abort', onAbort)
    try { opened.session.close() } catch { /* closed */ }
  }
}

export function grpcStatusError(trailers: Record<string, string>): Error | undefined {
  const status = trailers['grpc-status']
  if (status === undefined || status === '0') return undefined
  const message = trailers['grpc-message'] ?? `gRPC status ${status}`
  return new CursorWireError(status, message)
}

export function isResourceExhausted(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  if (error instanceof CursorWireError && ['resource_exhausted', '8'].includes(error.wireCode)) return true
  return /resource_exhausted/iu.test(error.message)
}
