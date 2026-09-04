# Changelog
## [0.2.17] - 2026-09-04

### Changed

- Include `AUTH` in the normal retryable set so remaining 401s follow the eight-retry policy after the existing adapter-level refresh retry.

## [0.2.16] - 2026-09-03

### Changed

- DSH compatibility declarations cover the verified Alpha.4 and rc.1 runtimes.
- Unknown runtimes warn once and use the normal best-effort mount path; only reproduced failures may be blocklisted.



## 0.2.13

- Settings → LLM Providers: drag cards to reorder; chat picker follows `llm-providers.order` via dsh-llm-providers-ui.


## 0.2.12

- Fix sandbox escalation-schema leak: narrow `sandbox_permissions` to strictly wider modes (`read-only` → both, `workspace-write` → `danger-full-access`, `danger-full-access` → remove) scanning both `options.system` and context-injected `options.messages` before `buildMcpToolDefinitions`, on both `stream` and `prepareCall` paths; preserves immutability and cleans `required`/`justification`


## 0.2.11

- Omit unknown zero token usage while retaining provider-reported token facts
- Support the DSH 0.1.2-alpha.1 Host image-pricing call with neutral heuristic pricing
- Restore published-RC and alpha1 client builds and add frozen-install CI

## 0.2.9

- Unify model catalog to opencode baseline (Context first row, Vision/Reasoning/Default thinking second row, 32/36px)

## 0.2.8

- Replace module-global parked Runs and conversation bindings with an adapter-owned lifecycle registry
- Bound parked Runs and idle bindings by TTL and capacity; reconcile live resources when settings change
- Close exact Runs on abort, session Runs on turn end, and all resources on session or plugin disposal
- Use recursively jittered heartbeats and enforce provider idle timeout after resumed MCP results

## 0.2.7

- Render Command Code and other new keyed providers in the shared LLM Providers section instead of a fixed four-plugin list.

## 0.2.6

- Preserve Composer image attachments when DSH appends same-turn injected user-role context
- Merge the trailing same-turn text and selected images into the active Cursor user action

## 0.2.5

- Own `prepareCall` so dsh 0.1.1-rc.2 Host can snapshot provider options before streaming
- Widen Host peer ranges to `>=0.1.0-rc.6 <0.1.1 || >=0.1.1-rc.1 <1.0.0`

## 0.2.4

- Align catalog families with Cursor: Grok 4.5/4.6 are Cursor, not xAI; `-thinking` collapses into the family; product-name `-max` stays its own model
- Add a `-1m` Fetch candidate only for families Cursor offers Max Context for; saving does not re-insert Max rows you left unchecked
- Default thinking levels match Cursor (GPT-5.6 Luna/Sol/Terra medium, Opus/GLM high)
- Flatten tool calls from other providers in chat history instead of replaying them as Cursor MCP

## 0.2.3

- Preserve Connect and gRPC status codes and classify deadlines, authentication, cancellation, invalid requests, HTTP status failures, and HTTP/2 transport faults precisely

## 0.2.2

- Retry model requests up to eight times by default; provider configuration can override the budget

## 0.2.1

- Show official reset time from usage-summary `billingCycleEnd` ("Usage limits reset on Sep 16 (30 days left)")
- Rename Settings nav/title from Providers to LLM Providers / LLM 供应商

## 0.2.0

- Move the settings card from Plugins to Settings → Providers
- The Providers nav row is claimed by the first installed provider plugin and disappears when all of them are uninstalled
- Collapsed cards show a short connection status and model count, not the account email
- Usage refresh shows a skeleton, a spinning official refresh glyph, a failure hint next to the button, and a last-updated clock

## 0.1.1

- Max is a first-class picker row (`composer-2.5-1m`) instead of a checkbox; Max rows send `maxMode: true` and use a 1M DSH context budget
- Per-row Context window; `defaultMaxTokens` no longer caps every request at 16k

## 0.1.0 — 2026-08-17

First release: unofficial Cursor subscription login and chat for DeepSeek Harness.

- Deep Control PKCE sign-in; session stored only on the Host
- HTTP/2 Connect `AgentService/Run` with parked MCP tool replies
- Account catalog via `GetUsableModels`; thinking levels collapse into one family; Fast SKUs stay separate
- Fetch picker groups Cursor first (Composer, Cursor Grok), then other labs; an empty saved catalog stays empty
- Per-family default thinking level (`defaultEffort`); chat uses it until the user picks one
- Plugin card: sign-in, catalog fetch/pick/sort/edit/save, subscription usage rails
- Not official CLI / Cloud Agents / `@cursor/sdk`. Cursor staff treat this class of private-client usage as against ToS; account ban is possible. See README.
