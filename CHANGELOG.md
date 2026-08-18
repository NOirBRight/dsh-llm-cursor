# Changelog

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
