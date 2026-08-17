/**
 * HTTP/2 Connect+proto client for AgentService.
 */

import { connect, constants } from 'node:http2'
import type { ClientHttp2Session, ClientHttp2Stream, IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http2'
import { LlmError } from '@deepseek-ai/dsh-llm'
import { CONNECT_END_STREAM_FLAG, frameConnectMessage, parseConnectEndStream, takeConnectFrames } from './connect.ts'

export const RUN_PATH = '/agent.v1.AgentService/Run'

export interface ConnectStream {
  session: ClientHttp2Session
  stream: ClientHttp2Stream
  trailers: Record<string, string>
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
    'SERVER',
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
  push: (chunk: Buffer) => void
  waitChunk: () => Promise<Buffer | undefined>
} {
  const trailers: Record<string, string> = {}
  const queue: Buffer[] = []
  const waiters: Array<(chunk: Buffer | undefined) => void> = []
  let ended = false

  const push = (chunk: Buffer): void => {
    const waiter = waiters.shift()
    if (waiter !== undefined) waiter(chunk)
    else queue.push(chunk)
  }
  const finish = (): void => {
    ended = true
    while (waiters.length > 0) waiters.shift()?.(undefined)
  }

  stream.on('data', (chunk: Buffer) => { push(chunk) })
  stream.on('trailers', (headers) => { Object.assign(trailers, headerRecord(headers)) })
  stream.on('end', finish)
  stream.on('close', finish)
  stream.on('error', finish)

  return {
    trailers,
    push,
    waitChunk: () => {
      if (queue.length > 0) return Promise.resolve(queue.shift())
      if (ended) return Promise.resolve(undefined)
      return new Promise((resolve) => { waiters.push(resolve) })
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
  const error = new Error(message)
  if (status === '8') error.name = 'resource_exhausted'
  return error
}

export function isResourceExhausted(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  if (error.name === 'resource_exhausted') return true
  return /resource_exhausted/iu.test(error.message)
}
