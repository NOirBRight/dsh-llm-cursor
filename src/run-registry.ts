/** Adapter-owned lifecycle registry for Cursor Run transports and conversation bindings. */

import { LlmError } from '@deepseek-ai/dsh-llm'
import type { BlobStore } from './history.ts'

/** Validated limits and timers owned by one Cursor adapter. */
export interface RunLifecycleOptions {
  /** Maximum time an unfinished Run may wait for tool results. */
  parkedRunTtlMs: number
  /** Maximum time a conversation binding with no Runs remains cached. */
  bindingIdleTtlMs: number
  /** Maximum active plus parked Runs owned by one adapter. */
  maxOpenRuns: number
  /** Maximum conversation bindings owned by one adapter. */
  maxBindings: number
  /** Base delay between Cursor client heartbeats. */
  heartbeatIntervalMs: number
  /** Symmetric per-heartbeat jitter ratio from zero through one half. */
  heartbeatJitterRatio: number
}

/** Default bounded lifecycle configuration for one Cursor adapter. */
export const DEFAULT_RUN_LIFECYCLE: RunLifecycleOptions = Object.freeze({
  parkedRunTtlMs: 900_000,
  bindingIdleTtlMs: 3_600_000,
  maxOpenRuns: 64,
  maxBindings: 256,
  heartbeatIntervalMs: 5_000,
  heartbeatJitterRatio: 0.1,
})

/** Stable Cursor conversation state associated with one DSH session. */
export interface ConversationBinding {
  /** Normalized DSH session identity used by registry indexes. */
  readonly sessionKey: string
  /** Cursor conversation identity reused by full-history fallback Runs. */
  conversationId: string
  /** Provider blobs shared by Runs using this binding. */
  blobStore: BlobStore
}

/** Transport hooks attached to a value tracked as one Cursor Run. */
export interface CursorRunResource<T> {
  /** Provider-specific Run state returned to the caller. */
  value: T
  /** Release the transport; the registry invokes it at most once. */
  close: () => void
  /** Write one heartbeat or throw when the write fails synchronously. */
  heartbeat: () => void
  /** Return whether the transport can no longer accept a heartbeat. */
  isClosed: () => boolean
}

/** Content-free reason recorded when a Run leaves the registry. */
export type RunCloseReason =
  | 'abort'
  | 'dispose'
  | 'heartbeat-closed'
  | 'heartbeat-failed'
  | 'park-capacity'
  | 'park-mismatch'
  | 'park-ttl'
  | 'resource-exhausted'
  | 'session-disposed'
  | 'stream-end'
  | 'stream-error'
  | 'turn-end'

type BindingDeleteReason = 'binding-capacity' | 'binding-ttl' | 'dispose' | 'session-disposed'

/** Registry identity and lifecycle state for one tracked Run value. */
export interface ManagedCursorRun<T> {
  /** Opaque process-local Run identity. */
  readonly id: string
  /** Normalized DSH session identity used by registry indexes. */
  readonly sessionKey: string
  /** Conversation state shared with replacement Runs for this session. */
  readonly binding: ConversationBinding
  /** Provider-specific Run state. */
  readonly value: T
  /** Current registry-owned lifecycle state. */
  state: 'active' | 'parked' | 'closed'
}

interface BindingRecord extends ConversationBinding {
  readonly runs: Set<ManagedCursorRun<unknown>>
  idleSince: number | undefined
  idleTimer: ReturnType<typeof setTimeout> | undefined
}

interface RunRecord<T> extends ManagedCursorRun<T> {
  readonly resource: CursorRunResource<T>
  heartbeatTimer: ReturnType<typeof setTimeout> | undefined
  parkedAt: number | undefined
  parkTimer: ReturnType<typeof setTimeout> | undefined
}

/** Deterministic test and diagnostic hooks for a registry. */
export interface CursorRunRegistryInternals {
  /** Monotonic-enough wall clock used for TTL ages. */
  now?: () => number
  /** Entropy source sampled independently for each heartbeat. */
  random?: () => number
  /** Observational diagnostic sink; callback failures are contained. */
  debug?: (message: string) => void
}

/** Owns every Run and binding created by one {@link CursorAdapter}. */
export class CursorRunRegistry<T> {
  private readonly runs = new Set<RunRecord<T>>()
  private readonly runsBySession = new Map<string, Set<RunRecord<T>>>()
  private readonly bindings = new Map<string, BindingRecord>()
  private readonly now: () => number
  private readonly random: () => number
  private readonly debug: ((message: string) => void) | undefined
  private lifecycle: RunLifecycleOptions
  private disposed = false

  /**
   * @param lifecycle - validated lifecycle configuration.
   * @param internals - deterministic clock, entropy, and diagnostics for the owning adapter.
   */
  constructor(lifecycle: RunLifecycleOptions, internals: CursorRunRegistryInternals = {}) {
    this.lifecycle = lifecycle
    this.now = internals.now ?? Date.now
    this.random = internals.random ?? Math.random
    this.debug = internals.debug
  }

  /**
   * Return the stable binding for a session, creating an idle binding when absent.
   * @param sessionId - optional DSH session identity.
   * @returns the existing or newly created conversation binding.
   * @throws {@link LlmError} with `LOCAL_CAPACITY` when every binding is live.
   */
  binding(sessionId: string | undefined): ConversationBinding {
    return this.bindingRecord(sessionKeyOf(sessionId))
  }

  /**
   * Rotate the session conversation after Cursor rejects an unused conversation.
   * @param sessionId - optional DSH session identity.
   * @returns the replacement Cursor conversation identity.
   * @throws {@link LlmError} with `LOCAL_CAPACITY` when creating the binding would evict live state.
   */
  rotateBinding(sessionId: string | undefined): string {
    const binding = this.bindingRecord(sessionKeyOf(sessionId))
    binding.conversationId = crypto.randomUUID()
    binding.blobStore = new Map()
    return binding.conversationId
  }

  /**
   * Reserve capacity, obtain the session binding, and synchronously open a transport.
   * The factory is never called when all Run capacity is active.
   * @param sessionId - optional DSH session identity.
   * @param factory - opens the provider transport after capacity has been reserved.
   * @returns the registry-owned Run identity and provider value.
   * @throws {@link LlmError} with non-default-retry `LOCAL_CAPACITY` before `factory` when active Runs or bindings fill capacity.
   */
  openRun(sessionId: string | undefined, factory: (binding: ConversationBinding) => CursorRunResource<T>): ManagedCursorRun<T> {
    if (this.disposed) throw new LlmError('llm-cursor: adapter is disposed', 'LOCAL_CAPACITY')
    this.reconcileRunCapacity(this.lifecycle.maxOpenRuns - 1)
    if (this.runs.size >= this.lifecycle.maxOpenRuns) {
      throw new LlmError('llm-cursor: local Cursor Run capacity is full', 'LOCAL_CAPACITY')
    }

    const sessionKey = sessionKeyOf(sessionId)
    const binding = this.bindingRecord(sessionKey)
    this.markBindingLive(binding)
    let resource: CursorRunResource<T>
    try {
      resource = factory(binding)
    } catch (error) {
      this.markBindingIdleIfEmpty(binding)
      throw error
    }
    const run: RunRecord<T> = {
      id: crypto.randomUUID(),
      sessionKey,
      binding,
      value: resource.value,
      resource,
      state: 'active',
      heartbeatTimer: undefined,
      parkedAt: undefined,
      parkTimer: undefined,
    }
    this.runs.add(run)
    binding.runs.add(run as ManagedCursorRun<unknown>)
    let sessionRuns = this.runsBySession.get(sessionKey)
    if (sessionRuns === undefined) {
      sessionRuns = new Set()
      this.runsBySession.set(sessionKey, sessionRuns)
    }
    sessionRuns.add(run)
    this.scheduleHeartbeat(run)
    return run
  }

  /**
   * Mark an active Run resumable and start its parked TTL.
   * @param run - Run returned by this registry.
   */
  park(run: ManagedCursorRun<T>): void {
    const record = this.recordOf(run)
    if (record === undefined || record.state === 'closed') return
    record.state = 'parked'
    record.parkedAt = this.now()
    this.scheduleParkExpiry(record)
  }

  /**
   * Atomically claim the oldest matching parked Run for a new request.
   * @param sessionId - optional DSH session identity.
   * @param matches - selects a parked provider value that can accept this request.
   * @returns the claimed active Run, or `undefined` when none match.
   */
  claimParked(sessionId: string | undefined, matches: (value: T) => boolean): ManagedCursorRun<T> | undefined {
    const sessionRuns = this.runsBySession.get(sessionKeyOf(sessionId))
    if (sessionRuns === undefined) return undefined
    const candidates = [...sessionRuns]
      .filter(run => run.state === 'parked')
      .sort((left, right) => (left.parkedAt ?? 0) - (right.parkedAt ?? 0))
    const selected = candidates.find(run => matches(run.value))
    if (selected === undefined) return undefined
    selected.state = 'active'
    selected.parkedAt = undefined
    if (selected.parkTimer !== undefined) clearTimeout(selected.parkTimer)
    selected.parkTimer = undefined
    return selected
  }

  /**
   * Close every parked Run for a session that cannot resume this request.
   * @param sessionId - optional DSH session identity.
   * @param reason - content-free lifecycle reason used by diagnostics.
   */
  closeParkedRuns(sessionId: string | undefined, reason: RunCloseReason): void {
    for (const run of [...this.runsBySession.get(sessionKeyOf(sessionId)) ?? []]) {
      if (run.state === 'parked') this.closeRun(run, reason)
    }
  }

  /**
   * Release exactly one Run and all of its timers. Idempotent.
   * @param run - Run returned by this registry.
   * @param reason - content-free lifecycle reason used by diagnostics.
   */
  closeRun(run: ManagedCursorRun<T>, reason: RunCloseReason): void {
    const record = this.recordOf(run)
    if (record === undefined || record.state === 'closed') return
    record.state = 'closed'
    if (record.heartbeatTimer !== undefined) clearTimeout(record.heartbeatTimer)
    if (record.parkTimer !== undefined) clearTimeout(record.parkTimer)
    record.heartbeatTimer = undefined
    record.parkTimer = undefined
    record.parkedAt = undefined
    try {
      record.resource.close()
    } catch (error) {
      this.report(`llm-cursor: Run close failed reason=${reason} error=${error instanceof Error ? error.name : 'unknown'}`)
    }
    this.runs.delete(record)
    const sessionRuns = this.runsBySession.get(record.sessionKey)
    sessionRuns?.delete(record)
    if (sessionRuns?.size === 0) this.runsBySession.delete(record.sessionKey)
    const binding = record.binding as BindingRecord
    binding.runs.delete(record as ManagedCursorRun<unknown>)
    this.markBindingIdleIfEmpty(binding)
    this.report(`llm-cursor: Run closed reason=${reason} openRuns=${this.runs.size} bindings=${this.bindings.size}`)
  }

  /**
   * Close all active and parked Runs for a session while retaining its binding.
   * @param sessionId - optional DSH session identity.
   * @param reason - content-free lifecycle reason used by diagnostics.
   */
  closeSessionRuns(sessionId: string | undefined, reason: RunCloseReason): void {
    for (const run of [...this.runsBySession.get(sessionKeyOf(sessionId)) ?? []]) this.closeRun(run, reason)
  }

  /**
   * Close all session Runs and delete the session binding.
   * @param sessionId - optional DSH session identity.
   * @param reason - session disposal reason recorded for Runs and the binding.
   */
  closeSession(sessionId: string | undefined, reason: 'session-disposed'): void {
    const key = sessionKeyOf(sessionId)
    this.closeSessionRuns(sessionId, reason)
    this.deleteIdleBinding(key, reason)
  }

  /**
   * Apply new timer and capacity limits to existing resources.
   * @param lifecycle - validated replacement lifecycle configuration.
   */
  reconfigure(lifecycle: RunLifecycleOptions): void {
    if (this.disposed) return
    if (Object.keys(lifecycle).every(key => (
      lifecycle[key as keyof RunLifecycleOptions] === this.lifecycle[key as keyof RunLifecycleOptions]
    ))) return
    this.lifecycle = lifecycle
    for (const run of this.runs) {
      if (run.heartbeatTimer !== undefined) clearTimeout(run.heartbeatTimer)
      run.heartbeatTimer = undefined
      this.scheduleHeartbeat(run)
      if (run.state === 'parked') this.scheduleParkExpiry(run)
    }
    for (const binding of this.bindings.values()) {
      if (binding.runs.size === 0) this.scheduleBindingExpiry(binding)
    }
    this.reconcileRunCapacity(lifecycle.maxOpenRuns)
    this.reconcileBindingCapacity(lifecycle.maxBindings)
  }

  /** Close every owned resource. Safe to call more than once. */
  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    for (const run of [...this.runs]) this.closeRun(run, 'dispose')
    for (const sessionKey of [...this.bindings.keys()]) this.deleteIdleBinding(sessionKey, 'dispose')
    this.runsBySession.clear()
  }

  /**
   * Return content-free counts for tests and lifecycle diagnostics.
   * @returns current aggregate Run and binding counts.
   */
  snapshot(): { openRuns: number; activeRuns: number; parkedRuns: number; bindings: number } {
    let activeRuns = 0
    let parkedRuns = 0
    for (const run of this.runs) {
      if (run.state === 'active') activeRuns += 1
      if (run.state === 'parked') parkedRuns += 1
    }
    return { openRuns: this.runs.size, activeRuns, parkedRuns, bindings: this.bindings.size }
  }

  private bindingRecord(sessionKey: string): BindingRecord {
    const existing = this.bindings.get(sessionKey)
    if (existing !== undefined) return existing
    if (this.disposed) throw new LlmError('llm-cursor: adapter is disposed', 'LOCAL_CAPACITY')
    this.reconcileBindingCapacity(this.lifecycle.maxBindings - 1)
    if (this.bindings.size >= this.lifecycle.maxBindings) {
      throw new LlmError('llm-cursor: local Cursor binding capacity is full', 'LOCAL_CAPACITY')
    }
    const binding: BindingRecord = {
      sessionKey,
      conversationId: crypto.randomUUID(),
      blobStore: new Map(),
      runs: new Set(),
      idleSince: this.now(),
      idleTimer: undefined,
    }
    this.bindings.set(sessionKey, binding)
    this.scheduleBindingExpiry(binding)
    return binding
  }

  private recordOf(run: ManagedCursorRun<T>): RunRecord<T> | undefined {
    return this.runs.has(run as RunRecord<T>) ? run as RunRecord<T> : undefined
  }

  private markBindingLive(binding: BindingRecord): void {
    if (binding.idleTimer !== undefined) clearTimeout(binding.idleTimer)
    binding.idleTimer = undefined
    binding.idleSince = undefined
  }

  private markBindingIdleIfEmpty(binding: BindingRecord): void {
    if (binding.runs.size > 0 || this.disposed) return
    binding.idleSince = this.now()
    this.scheduleBindingExpiry(binding)
  }

  private scheduleParkExpiry(run: RunRecord<T>): void {
    if (run.parkTimer !== undefined) clearTimeout(run.parkTimer)
    const parkedAt = run.parkedAt
    if (parkedAt === undefined) return
    const remaining = Math.max(0, this.lifecycle.parkedRunTtlMs - (this.now() - parkedAt))
    const timer = setTimeout(() => {
      if (run.parkTimer !== timer || run.state !== 'parked') return
      this.closeRun(run, 'park-ttl')
    }, remaining)
    timer.unref?.()
    run.parkTimer = timer
  }

  private scheduleBindingExpiry(binding: BindingRecord): void {
    if (binding.idleTimer !== undefined) clearTimeout(binding.idleTimer)
    const idleSince = binding.idleSince
    if (idleSince === undefined || binding.runs.size > 0) return
    const remaining = Math.max(0, this.lifecycle.bindingIdleTtlMs - (this.now() - idleSince))
    const timer = setTimeout(() => {
      if (binding.idleTimer !== timer || binding.runs.size > 0) return
      this.deleteIdleBinding(binding.sessionKey, 'binding-ttl')
    }, remaining)
    timer.unref?.()
    binding.idleTimer = timer
  }

  private scheduleHeartbeat(run: RunRecord<T>): void {
    if (run.state === 'closed' || this.disposed) return
    const ratio = this.lifecycle.heartbeatJitterRatio
    const delay = this.lifecycle.heartbeatIntervalMs * (1 + ((this.random() * 2) - 1) * ratio)
    const timer = setTimeout(() => {
      if (run.heartbeatTimer !== timer || run.state === 'closed') return
      run.heartbeatTimer = undefined
      if (run.resource.isClosed()) {
        this.closeRun(run, 'heartbeat-closed')
        return
      }
      try {
        run.resource.heartbeat()
      } catch {
        this.closeRun(run, 'heartbeat-failed')
        return
      }
      this.scheduleHeartbeat(run)
    }, delay)
    timer.unref?.()
    run.heartbeatTimer = timer
  }

  private reconcileRunCapacity(target: number): void {
    const parked = [...this.runs]
      .filter(run => run.state === 'parked')
      .sort((left, right) => (left.parkedAt ?? 0) - (right.parkedAt ?? 0))
    while (this.runs.size > target && parked.length > 0) {
      const oldest = parked.shift()
      if (oldest !== undefined) this.closeRun(oldest, 'park-capacity')
    }
  }

  private reconcileBindingCapacity(target: number): void {
    const idle = [...this.bindings.values()]
      .filter(binding => binding.runs.size === 0)
      .sort((left, right) => (left.idleSince ?? 0) - (right.idleSince ?? 0))
    while (this.bindings.size > target && idle.length > 0) {
      const oldest = idle.shift()
      if (oldest !== undefined) this.deleteIdleBinding(oldest.sessionKey, 'binding-capacity')
    }
  }

  private deleteIdleBinding(sessionKey: string, reason: BindingDeleteReason): void {
    const binding = this.bindings.get(sessionKey)
    if (binding === undefined || binding.runs.size > 0) return
    if (binding.idleTimer !== undefined) clearTimeout(binding.idleTimer)
    binding.idleTimer = undefined
    this.bindings.delete(sessionKey)
    this.report(`llm-cursor: Binding deleted reason=${reason} openRuns=${this.runs.size} bindings=${this.bindings.size}`)
  }

  private report(message: string): void {
    if (this.debug === undefined) return
    try {
      this.debug(message)
    } catch (diagnosticError) {
      // Diagnostics are observational; callback failure cannot alter lifecycle cleanup.
      void diagnosticError
    }
  }
}

/**
 * Normalize the optional LLM request session id for registry indexes.
 * @param sessionId - optional DSH session identity.
 * @returns the provided id or the registry's default-session sentinel.
 */
export function sessionKeyOf(sessionId: string | undefined): string {
  return sessionId ?? '__default__'
}
