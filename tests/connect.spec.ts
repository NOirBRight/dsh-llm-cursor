import { describe, expect, it } from 'vitest'
import { CONNECT_END_STREAM_FLAG, frameConnectMessage, parseConnectEndStream, takeConnectFrames } from '../src/wire/connect.ts'

describe('Connect frames', () => {
  it('round-trips a protobuf payload and splits a rolling buffer', () => {
    const first = frameConnectMessage(Buffer.from('abc'))
    const second = frameConnectMessage(Buffer.from('defg'))
    const joined = Buffer.concat([first, second.subarray(0, 3)])
    const taken = takeConnectFrames(joined)
    expect(taken.frames).toHaveLength(1)
    expect(Buffer.from(taken.frames[0]!.payload).toString()).toBe('abc')
    const rest = takeConnectFrames(Buffer.concat([taken.rest, second.subarray(3)]))
    expect(Buffer.from(rest.frames[0]!.payload).toString()).toBe('defg')
  })

  it('parses a Connect end-stream error', () => {
    const error = parseConnectEndStream(Buffer.from(JSON.stringify({
      error: { code: 'resource_exhausted', message: 'poisoned' },
    })))
    expect(error).toMatchObject({
      wireCode: 'resource_exhausted',
      message: expect.stringContaining('resource_exhausted'),
    })
    expect(parseConnectEndStream(Buffer.from('{}'))).toBeNull()
  })

  it('sets the end-stream flag', () => {
    const frame = frameConnectMessage(Buffer.from('x'), CONNECT_END_STREAM_FLAG)
    expect(frame[0]).toBe(CONNECT_END_STREAM_FLAG)
  })
})
