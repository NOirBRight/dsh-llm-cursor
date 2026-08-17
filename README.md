# dsh-llm-cursor

English | [中文](README.zh.md)

Unofficial Cursor subscription login and chat for DeepSeek Harness. This plugin is a separate provider route (`cursor`) and settings namespace (`llm-cursor`). It is **not** affiliated with Anysphere / Cursor, is **not** the official Cursor CLI, and it does not call official Cloud Agents or `@cursor/sdk`.

> **Ban risk — read this first.** Cursor staff treat this class of private-client usage as against the Terms of Service. **Your Cursor account can be restricted or banned.** Installing, signing in, or sending a chat is enough. This is not a grey area and running it only on your own machine does not protect the account. Details: [Risk and Terms of Service](#risk-and-terms-of-service).

The package root exposes the Cordis plugin contract. The same artifact exports `./client`, which contributes the Cursor card under Settings → Plugins → Plugin configuration.

## Installation

DeepSeek Harness 0.1.0-rc.6 or later is required. Install directly from GitHub. Signing in after install uses the same unofficial session as the rest of this plugin, so the ban risk above applies immediately:

~~~sh
dsh plugin --profile web add github:NOirBRight/dsh-llm-cursor
dsh web
~~~

The repository tracks release-ready lib artifacts, so GitHub installation needs no build-script allowlist. A source checkout can use a link installation after running `pnpm run build`.

## Web configuration

Open Settings → Plugins → Plugin configuration → Cursor. The card subtitle is the same warning as above: unofficial private endpoints; Cursor staff treat this as against ToS; **the account can be banned**.

![Cursor plugin card: ToS warning, sign-in, subscription usage, and saved catalog](docs/screenshots/plugin-card.png)

**Sign in with Cursor** starts a Host-owned Deep Control PKCE flow (the same session entry the official CLI uses), opens the system browser, and polls until the login completes. The session is stored only on the Host at `$DSH_HOME/cursor-oauth.json` (mode `0600`). The card then shows the account email when known. Sign out deletes that file. The browser never receives tokens.

This plugin does **not** read or write `~/.cursor` or official CLI credential files. There is no paste-code box and no Dashboard `crsr_…` API-key login.

After sign-in, **Fetch available models** reads the account catalog with `GetUsableModels`. Cursor lists every thinking-level SKU as a separate wire id; the plugin collapses those into one family and maps the chat thinking-level picker back to the matching wire id. Fast SKUs stay their own models, listed next to the standard sibling. You choose which families to keep, then reorder, rename, or edit capability flags and save. Chat uses that saved catalog.

![Fetch picker: choose which model families to keep in the catalog](docs/screenshots/catalog-picker.png)

![Chat model picker after the catalog is saved](docs/screenshots/chat-model-menu.png)

Chat itself goes through HTTP/2 Connect+protobuf `POST https://api2.cursor.sh/agent.v1.AgentService/Run`. DSH remains the only agent loop and tool executor. When signed in, the card also shows subscription usage from the Cursor dashboard rails (Cursor Models / Other Models, and On-Demand when it has spend or a cap). Logged-out cards do not request usage; an unrecognized surface is shown as unsupported, not as an error.

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

## Risk and Terms of Service

**This can get the Cursor account banned.** Do not treat a successful login, a working chat, or a low usage bar as a sign that it is allowed.

This plugin talks to **private Cursor client endpoints**, the same class of unofficial usage as Oh My Pi’s `cursor` provider: Deep Control PKCE login, then HTTP/2 Connect+protobuf `AgentService/Run` and `GetUsableModels` on `api2.cursor.sh`, plus dashboard usage rails.

Cursor staff have said that tools in this class violate [Cursor Terms of Service](https://cursor.com/terms-of-service) §1.5 (accessing the service except through official clients / reverse engineering private client APIs). See the staff reply on [this forum thread](https://forum.cursor.com/t/does-using-oh-my-pi-s-cursor-provider-or-an-openai-compatible-proxy-to-the-same-endpoints-violate-cursor-s-tos/167778/5). Enforcement can include account restriction or a permanent ban. Personal / local-only use, a paid subscription, and “I am not selling access” do not change that.

Official supported surfaces today are the Cursor IDE, Cursor CLI, [`@cursor/sdk`](https://cursor.com/docs/sdk), and Cloud Agents. Those run **Cursor’s agent harness**, not a raw model route that DeepSeek Harness can drive. A community request for an official OpenAI-compatible chat completions API is [open](https://forum.cursor.com/t/openai-compatible-v1-chat-completions-for-cloud-api/164522) with no published timeline.

This is not legal advice. Install and use at your own risk. Also see the [Acceptable Use Policy](https://cursor.com/acceptable-use-policy).

## Limitations

- HTTP/2 (ALPN) to `api2.cursor.sh` is required; there is no proxy bridge.
- The CLI version pin can break when Cursor ships a new CLI that the pin no longer satisfies. Changelog that change when it happens.
- Usage percents come from unofficial dashboard rails, not an official usage API.
- Token usage chunks from `Run` do not include cache fields, so DSH cache-hit rate stays empty.
- Fast SKUs are separate catalog families (`gpt-5.2` vs `gpt-5.2-fast`), not a third picker toggle.

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

There is no `apiKeyEnv` and no user-editable chat base URL or CLI version. The selected catalog is stored under `models` after you save it on the plugin card.

The Models page, if it lists Cursor at all, is hint-only. Because this package does not declare `apiKeyEnv`, that row must not show a missing-API-key badge.

## License

MIT. The vendored AgentService protobuf binding is derived from [oh-my-pi](https://github.com/can1357/oh-my-pi) (MIT); see `NOTICE`.
