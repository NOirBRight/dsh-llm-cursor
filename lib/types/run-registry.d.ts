/** Adapter-owned lifecycle registry for Cursor Run transports and conversation bindings. */
import type { BlobStore } from './history.ts';
/** Validated limits and timers owned by one Cursor adapter. */
export interface RunLifecycleOptions {
    /** Maximum time an unfinished Run may wait for tool results. */
    parkedRunTtlMs: number;
    /** Maximum time a conversation binding with no Runs remains cached. */
    bindingIdleTtlMs: number;
    /** Maximum active plus parked Runs owned by one adapter. */
    maxOpenRuns: number;
    /** Maximum conversation bindings owned by one adapter. */
    maxBindings: number;
    /** Base delay between Cursor client heartbeats. */
    heartbeatIntervalMs: number;
    /** Symmetric per-heartbeat jitter ratio from zero through one half. */
    heartbeatJitterRatio: number;
}
/** Default bounded lifecycle configuration for one Cursor adapter. */
export declare const DEFAULT_RUN_LIFECYCLE: RunLifecycleOptions;
/** Stable Cursor conversation state associated with one DSH session. */
export interface ConversationBinding {
    /** Normalized DSH session identity used by registry indexes. */
    readonly sessionKey: string;
    /** Cursor conversation identity reused by full-history fallback Runs. */
    conversationId: string;
    /** Provider blobs shared by Runs using this binding. */
    blobStore: BlobStore;
}
/** Transport hooks attached to a value tracked as one Cursor Run. */
export interface CursorRunResource<T> {
    /** Provider-specific Run state returned to the caller. */
    value: T;
    /** Release the transport; the registry invokes it at most once. */
    close: () => void;
    /** Write one heartbeat or throw when the write fails synchronously. */
    heartbeat: () => void;
    /** Return whether the transport can no longer accept a heartbeat. */
    isClosed: () => boolean;
}
/** Content-free reason recorded when a Run leaves the registry. */
export type RunCloseReason = 'abort' | 'dispose' | 'heartbeat-closed' | 'heartbeat-failed' | 'park-capacity' | 'park-mismatch' | 'park-ttl' | 'resource-exhausted' | 'session-disposed' | 'stream-end' | 'stream-error' | 'turn-end';
/** Registry identity and lifecycle state for one tracked Run value. */
export interface ManagedCursorRun<T> {
    /** Opaque process-local Run identity. */
    readonly id: string;
    /** Normalized DSH session identity used by registry indexes. */
    readonly sessionKey: string;
    /** Conversation state shared with replacement Runs for this session. */
    readonly binding: ConversationBinding;
    /** Provider-specific Run state. */
    readonly value: T;
    /** Current registry-owned lifecycle state. */
    state: 'active' | 'parked' | 'closed';
}
/** Deterministic test and diagnostic hooks for a registry. */
export interface CursorRunRegistryInternals {
    /** Monotonic-enough wall clock used for TTL ages. */
    now?: () => number;
    /** Entropy source sampled independently for each heartbeat. */
    random?: () => number;
    /** Observational diagnostic sink; callback failures are contained. */
    debug?: (message: string) => void;
}
/** Owns every Run and binding created by one {@link CursorAdapter}. */
export declare class CursorRunRegistry<T> {
    private readonly runs;
    private readonly runsBySession;
    private readonly bindings;
    private readonly now;
    private readonly random;
    private readonly debug;
    private lifecycle;
    private disposed;
    /**
     * @param lifecycle - validated lifecycle configuration.
     * @param internals - deterministic clock, entropy, and diagnostics for the owning adapter.
     */
    constructor(lifecycle: RunLifecycleOptions, internals?: CursorRunRegistryInternals);
    /**
     * Return the stable binding for a session, creating an idle binding when absent.
     * @param sessionId - optional DSH session identity.
     * @returns the existing or newly created conversation binding.
     * @throws {@link LlmError} with `LOCAL_CAPACITY` when every binding is live.
     */
    binding(sessionId: string | undefined): ConversationBinding;
    /**
     * Rotate the session conversation after Cursor rejects an unused conversation.
     * @param sessionId - optional DSH session identity.
     * @returns the replacement Cursor conversation identity.
     * @throws {@link LlmError} with `LOCAL_CAPACITY` when creating the binding would evict live state.
     */
    rotateBinding(sessionId: string | undefined): string;
    /**
     * Reserve capacity, obtain the session binding, and synchronously open a transport.
     * The factory is never called when all Run capacity is active.
     * @param sessionId - optional DSH session identity.
     * @param factory - opens the provider transport after capacity has been reserved.
     * @returns the registry-owned Run identity and provider value.
     * @throws {@link LlmError} with non-default-retry `LOCAL_CAPACITY` before `factory` when active Runs or bindings fill capacity.
     */
    openRun(sessionId: string | undefined, factory: (binding: ConversationBinding) => CursorRunResource<T>): ManagedCursorRun<T>;
    /**
     * Mark an active Run resumable and start its parked TTL.
     * @param run - Run returned by this registry.
     */
    park(run: ManagedCursorRun<T>): void;
    /**
     * Atomically claim the oldest matching parked Run for a new request.
     * @param sessionId - optional DSH session identity.
     * @param matches - selects a parked provider value that can accept this request.
     * @returns the claimed active Run, or `undefined` when none match.
     */
    claimParked(sessionId: string | undefined, matches: (value: T) => boolean): ManagedCursorRun<T> | undefined;
    /**
     * Close every parked Run for a session that cannot resume this request.
     * @param sessionId - optional DSH session identity.
     * @param reason - content-free lifecycle reason used by diagnostics.
     */
    closeParkedRuns(sessionId: string | undefined, reason: RunCloseReason): void;
    /**
     * Release exactly one Run and all of its timers. Idempotent.
     * @param run - Run returned by this registry.
     * @param reason - content-free lifecycle reason used by diagnostics.
     */
    closeRun(run: ManagedCursorRun<T>, reason: RunCloseReason): void;
    /**
     * Close all active and parked Runs for a session while retaining its binding.
     * @param sessionId - optional DSH session identity.
     * @param reason - content-free lifecycle reason used by diagnostics.
     */
    closeSessionRuns(sessionId: string | undefined, reason: RunCloseReason): void;
    /**
     * Close all session Runs and delete the session binding.
     * @param sessionId - optional DSH session identity.
     * @param reason - session disposal reason recorded for Runs and the binding.
     */
    closeSession(sessionId: string | undefined, reason: 'session-disposed'): void;
    /**
     * Apply new timer and capacity limits to existing resources.
     * @param lifecycle - validated replacement lifecycle configuration.
     */
    reconfigure(lifecycle: RunLifecycleOptions): void;
    /** Close every owned resource. Safe to call more than once. */
    dispose(): void;
    /**
     * Return content-free counts for tests and lifecycle diagnostics.
     * @returns current aggregate Run and binding counts.
     */
    snapshot(): {
        openRuns: number;
        activeRuns: number;
        parkedRuns: number;
        bindings: number;
    };
    private bindingRecord;
    private recordOf;
    private markBindingLive;
    private markBindingIdleIfEmpty;
    private scheduleParkExpiry;
    private scheduleBindingExpiry;
    private scheduleHeartbeat;
    private reconcileRunCapacity;
    private reconcileBindingCapacity;
    private deleteIdleBinding;
    private report;
}
/**
 * Normalize the optional LLM request session id for registry indexes.
 * @param sessionId - optional DSH session identity.
 * @returns the provided id or the registry's default-session sentinel.
 */
export declare function sessionKeyOf(sessionId: string | undefined): string;
//# sourceMappingURL=run-registry.d.ts.map