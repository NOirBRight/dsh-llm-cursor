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

  it('closes exactly one of multiple active Runs in the same session', () => {
    const registry = new CursorRunRegistry<TestRun>(DEFAULTS)
    const aborted = open(registry, 'same', 'aborted')
    const survivor = open(registry, 'same', 'survivor')

    registry.closeRun(aborted, 'abort')

    expect(aborted.value.close).toHaveBeenCalledOnce()
    expect(survivor.value.close).not.toHaveBeenCalled()
    expect(registry.snapshot()).toMatchObject({ openRuns: 1, activeRuns: 1 })
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

  it('chooses the oldest candidate when several parked Runs and idle bindings are eligible', () => {
    vi.useFakeTimers()
    const registry = new CursorRunRegistry<TestRun>({
      ...DEFAULTS,
      maxOpenRuns: 3,
      maxBindings: 4,
    })
    const firstParked = open(registry, 'park-1')
    registry.park(firstParked)
    vi.advanceTimersByTime(1)
    const secondParked = open(registry, 'park-2')
    registry.park(secondParked)
    vi.advanceTimersByTime(1)
    const active = open(registry, 'active')

    const replacement = open(registry, 'replacement')

    expect(firstParked.value.close).toHaveBeenCalledOnce()
    expect(secondParked.value.close).not.toHaveBeenCalled()
    expect(active.value.close).not.toHaveBeenCalled()
    registry.closeRun(secondParked, 'turn-end')
    registry.closeRun(replacement, 'turn-end')
    vi.advanceTimersByTime(1)
    registry.binding('later-idle')
    const firstIdleId = secondParked.binding.conversationId
    const laterIdleId = registry.binding('later-idle').conversationId
    registry.reconfigure({ ...DEFAULTS, maxOpenRuns: 3, maxBindings: 2 })

    expect(registry.binding('later-idle').conversationId).toBe(laterIdleId)
    expect(registry.binding('park-2').conversationId).not.toBe(firstIdleId)
    expect(active.value.close).not.toHaveBeenCalled()
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

  it('logs binding TTL, capacity, and session disposal with final aggregate counts', () => {
    vi.useFakeTimers()
    const ttlDebug = vi.fn()
    const ttlRegistry = new CursorRunRegistry<TestRun>({ ...DEFAULTS, bindingIdleTtlMs: 100 }, { debug: ttlDebug })
    ttlRegistry.binding('ttl-content')
    vi.advanceTimersByTime(100)
    expect(ttlDebug).toHaveBeenCalledWith(
      'llm-cursor: Binding deleted reason=binding-ttl openRuns=0 bindings=0',
    )

    const capacityDebug = vi.fn()
    const capacityRegistry = new CursorRunRegistry<TestRun>({ ...DEFAULTS, maxBindings: 2 }, { debug: capacityDebug })
    capacityRegistry.binding('old-content')
    vi.advanceTimersByTime(1)
    capacityRegistry.binding('new-content')
    capacityRegistry.binding('replacement-content')
    expect(capacityDebug).toHaveBeenCalledWith(
      'llm-cursor: Binding deleted reason=binding-capacity openRuns=0 bindings=1',
    )

    const sessionDebug = vi.fn()
    const sessionRegistry = new CursorRunRegistry<TestRun>(DEFAULTS, { debug: sessionDebug })
    open(sessionRegistry, 'session-content')
    sessionRegistry.closeSession('session-content', 'session-disposed')
    expect(sessionDebug).toHaveBeenCalledWith(
      'llm-cursor: Binding deleted reason=session-disposed openRuns=0 bindings=0',
    )
    expect(sessionDebug.mock.calls.flat().join('\n')).not.toContain('session-content')

    ttlRegistry.dispose()
    capacityRegistry.dispose()
    sessionRegistry.dispose()
  })

  it('contains throwing diagnostics while disposal clears every Run, timer, and binding', () => {
    vi.useFakeTimers()
    const registry = new CursorRunRegistry<TestRun>(DEFAULTS, {
      debug: () => { throw new Error('diagnostic failed') },
    })
    const active = open(registry, 'active')
    active.value.close.mockImplementationOnce(() => { throw new Error('transport close failed') })
    const parked = open(registry, 'parked')
    registry.park(parked)
    const heartbeatClosed = open(registry, 'heartbeat-closed')
    heartbeatClosed.value.closed = true

    expect(() => vi.advanceTimersByTime(6_000)).not.toThrow()
    expect(heartbeatClosed.value.close).toHaveBeenCalledOnce()

    expect(() => registry.dispose()).not.toThrow()
    expect(() => vi.runAllTimers()).not.toThrow()
    expect(active.value.close).toHaveBeenCalledOnce()
    expect(parked.value.close).toHaveBeenCalledOnce()
    expect(registry.snapshot()).toEqual({ openRuns: 0, activeRuns: 0, parkedRuns: 0, bindings: 0 })
  })
})
