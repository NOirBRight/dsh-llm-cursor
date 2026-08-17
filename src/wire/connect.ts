/** Connect protocol framing for Cursor AgentService streams. */

export const CONNECT_END_STREAM_FLAG = 0b00000010

export function frameConnectMessage(data: Uint8Array, flags = 0): Buffer {
  const frame = Buffer.alloc(5 + data.length)
  frame[0] = flags
  frame.writeUInt32BE(data.length, 1)
  frame.set(data, 5)
  return frame
}

export function parseConnectEndStream(data: Uint8Array): Error | null {
  try {
    const payload = JSON.parse(new TextDecoder().decode(data)) as { error?: { code?: string, message?: string } }
    const error = payload.error
    if (error) {
      const code = typeof error.code === 'string' ? error.code : 'unknown'
      const message = typeof error.message === 'string' ? error.message : 'Unknown error'
      return new Error(`Connect error ${code}: ${message}`)
    }
    return null
  } catch {
    return new Error('Failed to parse Connect end stream')
  }
}

export interface ConnectFrame {
  flags: number
  payload: Uint8Array
}

/** Pull complete Connect frames from a rolling buffer. */
export function takeConnectFrames(buffer: Buffer): { frames: ConnectFrame[], rest: Buffer } {
  const frames: ConnectFrame[] = []
  let rest = buffer
  while (rest.length >= 5) {
    const flags = rest[0] ?? 0
    const msgLen = rest.readUInt32BE(1)
    if (rest.length < 5 + msgLen) break
    frames.push({ flags, payload: rest.subarray(5, 5 + msgLen) })
    rest = rest.subarray(5 + msgLen)
  }
  return { frames, rest }
}
