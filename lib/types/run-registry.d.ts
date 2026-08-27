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
    readonly sessionKey: string;
    conversationId: string;
    blobStore: BlobStore;
}
/** Transport hooks attached to a value tracked as one Cursor Run. */
export interface CursorRunResource<T> {
    value: T;
    close: () => void;
    heartbeat: () => void;
    isClosed: () => boolean;
}
/** Content-free reason recorded when a Run leaves the registry. */
export type RunCloseReason = 'abort' | 'binding-capacity' | 'dispose' | 'heartbeat-closed' | 'heartbeat-failed' | 'park-capacity' | 'park-mismatch' | 'park-ttl' | 'resource-exhausted' | 'session-disposed' | 'stream-end' | 'stream-error' | 'turn-end';
/** Registry identity and lifecycle state for one tracked Run value. */
export interface ManagedCursorRun<T> {
    readonly id: string;
    readonly sessionKey: string;
    readonly binding: ConversationBinding;
    readonly value: T;
    state: 'active' | 'parked' | 'closed';
}
/** Deterministic test and diagnostic hooks for a registry. */
export interface CursorRunRegistryInternals {
    now?: () => number;
    random?: () => number;
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
    /** Return the stable binding for a session, creating an idle binding when absent. */
    binding(sessionId: string | undefined): ConversationBinding;
    /** Rotate the session conversation after Cursor rejects an unused conversation. */
    rotateBinding(sessionId: string | undefined): string;
    /**
     * Reserve capacity, obtain the session binding, and synchronously open a transport.
     * The factory is never called when all Run capacity is active.
     */
    openRun(sessionId: string | undefined, factory: (binding: ConversationBinding) => CursorRunResource<T>): ManagedCursorRun<T>;
    /** Mark an active Run resumable and start its parked TTL. */
    park(run: ManagedCursorRun<T>): void;
    /** Atomically claim the oldest matching parked Run for a new request. */
    claimParked(sessionId: string | undefined, matches: (value: T) => boolean): ManagedCursorRun<T> | undefined;
    /** Close every parked Run for a session that cannot resume this request. */
    closeParkedRuns(sessionId: string | undefined, reason: RunCloseReason): void;
    /** Release exactly one Run and all of its timers. Idempotent. */
    closeRun(run: ManagedCursorRun<T>, reason: RunCloseReason): void;
    /** Close all active and parked Runs for a session while retaining its binding. */
    closeSessionRuns(sessionId: string | undefined, reason: RunCloseReason): void;
    /** Close all session Runs and delete the session binding. */
    closeSession(sessionId: string | undefined, reason: RunCloseReason): void;
    /** Apply new timer and capacity limits to existing resources. */
    reconfigure(lifecycle: RunLifecycleOptions): void;
    /** Close every owned resource. Safe to call more than once. */
    dispose(): void;
    /** Return content-free counts for tests and lifecycle diagnostics. */
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
}
/** Normalize the optional LLM request session id for registry indexes. */
export declare function sessionKeyOf(sessionId: string | undefined): string;
//# sourceMappingURL=run-registry.d.ts.map