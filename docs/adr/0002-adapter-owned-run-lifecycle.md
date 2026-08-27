# ADR 0002: Adapter-owned Cursor Run lifecycle

English | [中文](0002-adapter-owned-run-lifecycle.zh.md)

## Status

Accepted — 2026-08-27

## Context

An unfinished Cursor `Run` remains open across the DSH tool boundary so the next turn can write `mcpResult` on the same stream. Module-global parked Runs and conversation bindings made separate adapter instances share ownership, could close the wrong request on abort, and had no bounded lifetime or capacity. A resumed stream also treated provider silence as local work and could wait forever after writing the tool result.

## Decision

Each `CursorAdapter` owns one `CursorRunRegistry`. The registry tracks every active and parked Run, indexes them by DSH session, and owns the conversation bindings, heartbeats, park expiry, binding expiry, and capacity limits. Claiming a parked Run changes it to active synchronously before `mcpResult` is written.

Request abort closes only the Run claimed or opened by that request. `turn/end` closes all Runs for the DSH session but retains its binding; `session/disposed` also deletes the binding. The Cordis effect disposer closes every remaining Run and clears every timer and binding. Park expiry closes the transport but retains the binding, so a later tool result opens a new Run from full DSH history with Cursor's resume action.

Heartbeats use recursively scheduled timeouts and draw fresh symmetric jitter for each write. A closed stream or heartbeat write failure releases the Run. Provider silence after a resumed `mcpResult` is governed by `streamIdleTimeoutMs` like any other provider wait.

Capacity recovery first closes the oldest parked Run, then deletes the oldest idle binding. Active Runs and their bindings are never evicted. If all Run slots are active, opening fails with non-default-retry `LOCAL_CAPACITY` before an HTTP/2 stream is created.

## Consequences

- Adapter instances are isolated and every transport has one lifecycle owner.
- Parked transports and idle conversation state are bounded by time and count.
- Settings changes reschedule existing timers and reconcile reduced capacities without evicting active work.
- Lifecycle diagnostics contain a stable reason and aggregate counts, never prompts, tool results, or token contents.

## Alternatives rejected

- **Keep module-global maps and add more cleanup calls.** Ownership would still cross adapter and plugin lifetimes, so exact cancellation and disposal would remain unreliable.
- **Close every Run at the DSH tool boundary.** This discards the provider's preferred same-stream `mcpResult` path and makes full-history replay the normal path.
- **Move Cursor transport state into DSH core.** The state and protocol are provider-specific; session events already provide the lifecycle signals the plugin needs.
