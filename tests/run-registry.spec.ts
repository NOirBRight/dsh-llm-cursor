import { afterEach, describe, expect, it, vi } from 'vitest'
import { CursorRunRegistry, type RunLifecycleOptions } from '../src/run-registry.ts'

const DEFAULTS: RunLifecycleOptions = {
  parkedRunTtlMs: 900_000,
  bindingIdleTtlMs: 3_600_000,
  maxOpenRuns: 64,
  maxBindings: 256,
  heartbeatIntervalMs: 5_000,
  heartbeatJitterRatio: 0.1,
}

interface TestRun {
  readonly label: string
  readonly close: ReturnType<typeof vi.fn>
  readonly heartbeat: ReturnType<typeof vi.fn>
  closed: boolean
}

function open(registry: CursorRunRegistry<TestRun>, sessionId: string, label = sessionId) {
  const value: TestRun = {
    label,
    close: vi.fn(function (this: TestRun) { this.closed = true }),
    heartbeat: vi.fn(),
    closed: false,
  }
  return registry.openRun(sessionId, () => ({
    value,
    close: () => { value.close() },
    heartbeat: () => { value.heartbeat() },
    isClosed: () => value.closed,
  }))
}

afterEach(() => {
  vi.useRealTimers()
})

describe('CursorRunRegistry', () => {
  it('isolates Runs and conversation bindings between adapter-owned registries', () => {
    const first = new CursorRunRegistry<TestRun>(DEFAULTS)
    const second = new CursorRunRegistry<TestRun>(DEFAULTS)
    const run = open(first, 'same')

    expect(first.binding('same').conversationId).not.toBe(second.binding('same').conversationId)
    expect(first.snapshot()).toMatchObject({ openRuns: 1, bindings: 1 })
    expect(second.snapshot()).toMatchObject({ openRuns: 0, bindings: 1 })

    first.dispose()
    second.dispose()
    expect(run.value.close).toHaveBeenCalledOnce()
  })

  it('expires the exact parked Run without deleting its binding and ignores a stale TTL', () => {
    vi.useFakeTimers()
    const registry = new CursorRunRegistry<TestRun>({ ...DEFAULTS, parkedRunTtlMs: 6_000 })
    const first = open(registry, 's')
    const conversationId = first.binding.conversationId
    registry.park(first)
    vi.advanceTimersByTime(3_000)
    const claimed = registry.claimParked('s', value => value.label === 's')
    expect(claimed).toBe(first)
    registry.park(claimed!)

    vi.advanceTimersByTime(3_100)
    expect(first.value.close).not.toHaveBeenCalled()
    vi.advanceTimersByTime(3_000)
    expect(first.value.close).toHaveBeenCalledOnce()
    expect(registry.binding('s').conversationId).toBe(conversationId)
    registry.dispose()
  })

  it('claims one parked Run atomically', () => {
    const registry = new CursorRunRegistry<TestRun>(DEFAULTS)
    const run = open(registry, 's')
    registry.park(run)

    expect(registry.claimParked('s', value => value.label === 's')).toBe(run)
    expect(registry.claimParked('s', () => true)).toBeUndefined()
    expect(run.state).toBe('active')
    registry.dispose()
  })

  it('expires only idle bindings and reschedules their TTL when the last Run closes', () => {
    vi.useFakeTimers()
    const registry = new CursorRunRegistry<TestRun>({ ...DEFAULTS, bindingIdleTtlMs: 2_000 })
    const run = open(registry, 's')
    const firstId = run.binding.conversationId
    vi.advanceTimersByTime(3_000)
    expect(registry.binding('s').conversationId).toBe(firstId)

    registry.closeRun(run, 'turn-end')
    vi.advanceTimersByTime(1_999)
    expect(registry.binding('s').conversationId).toBe(firstId)
    vi.advanceTimersByTime(1)
    expect(registry.binding('s').conversationId).not.toBe(firstId)
    registry.dispose()
  })

  it('evicts the oldest parked Run, then the oldest idle binding, and never a live binding', () => {
    vi.useFakeTimers()
    const registry = new CursorRunRegistry<TestRun>({
      ...DEFAULTS,
      maxOpenRuns: 2,
      maxBindings: 2,
    })
    const oldest = open(registry, 'oldest')
    registry.park(oldest)
    vi.advanceTimersByTime(1)
    const live = open(registry, 'live')
    const replacement = open(registry, 'replacement')

    expect(oldest.value.close).toHaveBeenCalledOnce()
    expect(live.value.close).not.toHaveBeenCalled()
    expect(replacement.binding.sessionKey).toBe('replacement')
    expect(registry.snapshot()).toMatchObject({ openRuns: 2, bindings: 2 })
    registry.dispose()
  })

  it('rejects all-active saturation before invoking the transport factory', () => {
    const registry = new CursorRunRegistry<TestRun>({ ...DEFAULTS, maxOpenRuns: 1 })
    open(registry, 'live')
    const factory = vi.fn()

    expect(() => registry.openRun('blocked', factory)).toThrow(expect.objectContaining({
      code: 'LOCAL_CAPACITY',
    }))
    expect(factory).not.toHaveBeenCalled()
    registry.dispose()
  })

  it('disposes Runs, timers, and bindings idempotently', () => {
    vi.useFakeTimers()
    const registry = new CursorRunRegistry<TestRun>(DEFAULTS)
    const active = open(registry, 'active')
    const parked = open(registry, 'parked')
    registry.park(parked)

    registry.dispose()
    registry.dispose()
    vi.runAllTimers()

    expect(active.value.close).toHaveBeenCalledOnce()
    expect(parked.value.close).toHaveBeenCalledOnce()
    expect(registry.snapshot()).toEqual({ openRuns: 0, activeRuns: 0, parkedRuns: 0, bindings: 0 })
  })

  it('draws fresh symmetric jitter for every recursive heartbeat', () => {
    vi.useFakeTimers()
    const random = vi.fn()
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1)
      .mockReturnValueOnce(0.5)
    const registry = new CursorRunRegistry<TestRun>(
      { ...DEFAULTS, heartbeatIntervalMs: 1_000, heartbeatJitterRatio: 0.1, parkedRunTtlMs: 2_000 },
      { random },
    )
    const run = open(registry, 's')

    vi.advanceTimersByTime(899)
    expect(run.value.heartbeat).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1)
    expect(run.value.heartbeat).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1_100)
    expect(run.value.heartbeat).toHaveBeenCalledTimes(2)
    vi.advanceTimersByTime(1_000)
    expect(run.value.heartbeat).toHaveBeenCalledTimes(3)
    expect(random).toHaveBeenCalledTimes(4)
    registry.dispose()
  })

  it('releases a Run when a heartbeat write fails or the stream is closed', () => {
    vi.useFakeTimers()
    const registry = new CursorRunRegistry<TestRun>({
      ...DEFAULTS,
      heartbeatIntervalMs: 100,
      heartbeatJitterRatio: 0,
    })
    const failed = open(registry, 'failed')
    failed.value.heartbeat.mockImplementationOnce(() => { throw new Error('write failed') })
    const closed = open(registry, 'closed')
    closed.value.closed = true

    vi.advanceTimersByTime(100)

    expect(failed.value.close).toHaveBeenCalledOnce()
    expect(closed.value.close).toHaveBeenCalledOnce()
    expect(registry.snapshot().openRuns).toBe(0)
    registry.dispose()
  })

  it('reconfigures live timers and reconciles capacity without closing active Runs', () => {
    vi.useFakeTimers()
    const registry = new CursorRunRegistry<TestRun>(DEFAULTS)
    const parked = open(registry, 'parked')
    registry.park(parked)
    const active = open(registry, 'active')
    registry.closeRun(open(registry, 'idle'), 'turn-end')

    registry.reconfigure({
      ...DEFAULTS,
      parkedRunTtlMs: 6_000,
      bindingIdleTtlMs: 2_000,
      maxOpenRuns: 1,
      maxBindings: 1,
    })

    expect(parked.value.close).toHaveBeenCalledOnce()
    expect(active.value.close).not.toHaveBeenCalled()
    expect(registry.snapshot()).toMatchObject({ openRuns: 1, activeRuns: 1, bindings: 1 })
    registry.dispose()
  })

  it('reconfigures heartbeat, parked, and idle-binding timers from their original ages', () => {
    vi.useFakeTimers()
    const registry = new CursorRunRegistry<TestRun>(DEFAULTS)
    const parked = open(registry, 'parked')
    registry.park(parked)
    registry.binding('idle')
    vi.advanceTimersByTime(1_000)

    registry.reconfigure({
      ...DEFAULTS,
      parkedRunTtlMs: 1_500,
      bindingIdleTtlMs: 1_200,
      heartbeatIntervalMs: 100,
      heartbeatJitterRatio: 0,
    })
    vi.advanceTimersByTime(100)
    expect(parked.value.heartbeat).toHaveBeenCalledOnce()
    expect(registry.snapshot().bindings).toBe(2)
    vi.advanceTimersByTime(100)
    expect(registry.snapshot().bindings).toBe(1)
    vi.advanceTimersByTime(300)
    expect(parked.value.close).toHaveBeenCalledOnce()
    expect(registry.snapshot()).toMatchObject({ openRuns: 0, bindings: 1 })
    registry.dispose()
  })

  it('logs only a stable lifecycle reason and aggregate counts', () => {
    const debug = vi.fn()
    const registry = new CursorRunRegistry<TestRun>(DEFAULTS, { debug })
    const run = open(registry, 'session-secret', 'tool-result-secret')

    registry.closeRun(run, 'turn-end')

    expect(debug).toHaveBeenCalledWith('llm-cursor: Run closed reason=turn-end openRuns=0 bindings=1')
    expect(debug.mock.calls.flat().join('\n')).not.toMatch(/session-secret|tool-result-secret/u)
    registry.dispose()
  })
})
