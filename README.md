# dsh-llm-cursor

English | [中文](README.zh.md)

Cursor subscription login and chat for DeepSeek Harness. This plugin is a separate provider route (`cursor`) and settings namespace (`llm-cursor`). It is **not** the official Cursor CLI, and it does not call official Cloud Agents or `@cursor/sdk`.

The package root exposes the Cordis plugin contract. The same artifact exports `./client`, which contributes the Cursor card under Settings → Plugins → Plugin configuration.

## Installation

DeepSeek Harness 0.1.0-rc.6 or later is required. Install directly from GitHub:

~~~sh
dsh plugin --profile web add github:NOirBRight/dsh-llm-cursor
dsh web
~~~

The repository tracks release-ready lib artifacts, so GitHub installation needs no build-script allowlist. A source checkout can use a link installation after running `pnpm run build`.

## Web configuration

Open Settings → Plugins → Plugin configuration → Cursor. **Sign in with Cursor** starts a Host-owned Deep Control PKCE flow (the same session entry the official CLI uses), opens the system browser, and polls until the login completes. The session is stored only on the Host at `$DSH_HOME/cursor-oauth.json` (mode `0600`). The card then shows the account email when known. Sign out deletes that file. The browser never receives tokens.

This plugin does **not** read or write `~/.cursor` or official CLI credential files. There is no paste-code box and no Dashboard `crsr_…` API-key login.

The frozen model catalog is shown read-only. After sign-in, `GetUsableModels` refreshes the picker list. Chat goes through HTTP/2 Connect+protobuf `POST https://api2.cursor.sh/agent.v1.AgentService/Run`. DSH remains the only agent loop and tool executor. When signed in, the card also shows subscription usage from Host reads of `/auth/usage` and, when a user id is known, `cursor.com/api/usage-summary`. Logged-out cards do not request usage; an unrecognized surface is shown as unsupported, not as an error.

Chat without a session fails `MISSING_CREDENTIAL`. A stored session whose refresh fails is cleared and fails `AUTH`.

## Compatibility headers

The Cursor session entry currently requires CLI-shaped request headers. This package sends:

- `x-cursor-client-type: cli`
- `x-cursor-client-version: cli-2026.01.09-231024f` (pinned in source; changelog when it changes)
- `x-ghost-mode: true` (this process does not execute Cursor workspace tools)
- `X-Dsh-Plugin: dsh-llm-cursor/<version>`
- the harness `attributionHeaders()`

These headers are a compatibility constraint so the session entry accepts the request. They are not an attempt to impersonate the official Cursor CLI product.

HTTP/2 (including ALPN) to `api2.cursor.sh` is required. V1 does not add a proxy bridge; a transport failure names HTTP/2 in the error.

## Config

~~~yaml
- id: llm-cursor
  name: 'dsh-llm-cursor'
  config:
    streamIdleTimeoutMs: 300000
    retryPolicy:
      mode: normal
      backoff:
        initialDelayMs: 500
        maxDelayMs: 10000
        jitterRatio: 0.1
~~~

There is no `apiKeyEnv` and no user-editable chat base URL or CLI version. The last successful catalog may be stored under `models` after discovery.

The Models page, if it lists Cursor at all, is hint-only. Because this package does not declare `apiKeyEnv`, that row must not show a missing-API-key badge.

## License

MIT. The vendored AgentService protobuf binding is derived from [oh-my-pi](https://github.com/can1357/oh-my-pi) (MIT); see `NOTICE`.
