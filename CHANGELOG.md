# Changelog

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
