# dsh-llm-cursor

English | [中文](README.zh.md)

Unofficial Cursor subscription login and chat for DeepSeek Harness. This plugin is a separate provider route (`cursor`) and settings namespace (`llm-cursor`). It is **not** affiliated with Anysphere / Cursor, is **not** the official Cursor CLI, and it does not call official Cloud Agents or `@cursor/sdk`.

> **Ban risk — read this first.** Cursor staff treat this class of private-client usage as against the Terms of Service. **Your Cursor account can be restricted or banned.** Installing, signing in, or sending a chat is enough. This is not a grey area and running it only on your own machine does not protect the account. Details: [Risk and Terms of Service](#risk-and-terms-of-service).

The package root exposes the Cordis plugin contract. The same artifact exports `./client`, which contributes the Cursor card under Settings → LLM Providers.


## Compatibility

Host `@deepseek-ai/dsh-*` packages are not version-locked: peers are `*` and optional. `devDependencies` pin the compile target (`0.1.5-rc.1`). Cordis stays `>=4.0.2 <5.0.0`.

Verified Hosts in `package.json#dsh.compatibility.dshReleases` are evidence, not an allowlist. Unknown newer Hosts warn once and keep the normal mount path. Only a reproduced failure is blocklisted.

## Installation

Verified on DeepSeek Harness `0.1.5-rc.1` and `0.1.5-rc.2`. Install directly from GitHub. Signing in after install uses the same unofficial session as the rest of this plugin, so the ban risk above applies immediately:

~~~sh
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/download/v0.2.8/dsh-llm-providers-ui-0.2.8.tgz
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-cursor/releases/download/v0.2.22/dsh-llm-cursor-0.2.22.tgz
dsh web
~~~

The repository tracks release-ready lib artifacts, so GitHub installation needs no build-script allowlist. A source checkout can use a link installation after running `pnpm run build`.

## Web configuration

Open Settings → LLM Providers → Cursor. The card subtitle is the same warning as above: unofficial private endpoints; Cursor staff treat this as against ToS; **the account can be banned**.

![Cursor plugin card: ToS warning, sign-in, subscription usage, and saved catalog](docs/screenshots/plugin-card.png)

**Sign in with Cursor** starts a Host-owned Deep Control PKCE flow (the same session entry the official CLI uses), opens the system browser, and polls until the login completes. The session is stored only on the Host at `$DSH_HOME/cursor-oauth.json` (mode `0600`). The card then shows the account email when known. Sign out deletes that file. The browser never receives tokens.

This plugin does **not** read or write `~/.cursor` or official CLI credential files. There is no paste-code box and no Dashboard `crsr_…` API-key login.

After sign-in, **Fetch available models** reads the account catalog with `GetUsableModels`. Cursor lists every thinking-level SKU as a separate wire id; the plugin collapses those into one family and maps the chat thinking-level picker back to the matching wire id. Fast SKUs stay their own models. Fetch offers a sibling `-1m` row only for families Cursor actually has Max Context for (for example `claude-opus-5-1m`), not for every `maxMode` flag; saving keeps only the rows you picked. You can then reorder, rename, or edit capability flags. Chat uses that saved catalog.

![Fetch picker: choose which model families to keep in the catalog](docs/screenshots/catalog-picker.png)

![Chat model picker after the catalog is saved](docs/screenshots/chat-model-menu.png)

Chat itself goes through HTTP/2 Connect+protobuf `POST https://api2.cursor.sh/agent.v1.AgentService/Run`. DSH remains the only agent loop and tool executor. When signed in, the card also shows subscription usage from the Cursor dashboard rails (Cursor Models / Other Models, and On-Demand when it has spend or a cap). Logged-out cards do not request usage; an unrecognized surface is shown as unsupported, not as an error.

The collapsed header first-paints the last successful quota from the shared browser cache when no live reading is available (never on error or unsupported); signing in, signing out, or an authoritative signed-out status purges the cached quota in every bundle copy, even without providerDirectory.

Chat without a session fails `MISSING_CREDENTIAL`. A stored session whose refresh fails is cleared and fails `AUTH`. A request 401 force-refreshes once at the adapter; remaining `AUTH` failures are eligible for the bundle's eight normal retries.

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
- 1M SKUs appear in Fetch for families Cursor offers Max Context (`claude-opus-5` vs `claude-opus-5-1m`). Saving does not re-insert a Max row you left unchecked. The Max row always sends `maxMode: true`. Composer and Cursor Grok do not get a 1M row.
- You can also add a generic context row yourself (`claude-opus-5-272k`). The plugin peels a trailing `-<n>k` / `-<n>m` before talking to Cursor; DSH uses `n×1000` / `n×1,000,000` as the compaction budget. Cursor's API only has a binary `maxMode`, so a 272K row still sends `maxMode: false` — the suffix only changes DSH's compaction trigger. Product names such as `kimi-k3-max` are not treated as a context tier. The composer picker groups sibling rows that share a base id.

## Config

~~~yaml
- id: llm-cursor
  name: 'dsh-llm-cursor'
  config:
    streamIdleTimeoutMs: 300000
    runLifecycle:
      parkedRunTtlMs: 900000
      bindingIdleTtlMs: 3600000
      maxOpenRuns: 64
      maxBindings: 256
      heartbeatIntervalMs: 5000
      heartbeatJitterRatio: 0.1
    retryPolicy:
      mode: normal
      maxRetries: 8
      backoff:
        initialDelayMs: 500
        maxDelayMs: 10000
        jitterRatio: 0.1
~~~

The bundle retries eligible model-request failures up to eight times by default, including `AUTH`. Connect and gRPC deadlines use `TIMEOUT`; HTTP 429 uses `RATE_LIMIT`; HTTP/2 faults and premature stream endings use `TRANSPORT`; unavailable, resource-exhausted, and HTTP 5xx failures use `SERVER`. Cancellation, invalid-argument, and other HTTP 4xx failures remain non-retryable.

Each adapter instance owns its active Runs, parked Runs, and conversation bindings. A parked Run expires after 15 minutes by default, while its idle binding remains available for one hour so a later tool result can open a full-history resume Run. Capacity recovery evicts the oldest parked Run and then the oldest idle binding; it never evicts active work. If all 64 Run slots are active, the request fails locally with `LOCAL_CAPACITY` before opening a socket. Heartbeat jitter is sampled again for every write, and provider silence after a resumed `mcpResult` still uses `streamIdleTimeoutMs`. See [ADR 0002](docs/adr/0002-adapter-owned-run-lifecycle.md).

There is no `apiKeyEnv` and no user-editable chat base URL or CLI version. The selected catalog is stored under `models` after you save it on the plugin card.

The Models page, if it lists Cursor at all, is hint-only. Because this package does not declare `apiKeyEnv`, that row must not show a missing-API-key badge.

## Provider authentication flow

Settings are whitelist-decoded, revision-fenced, and secret-free.

Cursor uses external authentication: Host returns a UUID/PKCE authorization URL immediately, the browser opens it, and Host polls in the background. Begin, status, cancel, and logout are attempt-scoped. Restarting DSH cancels in-memory attempts; restart and begin a new provider flow.

The Host `/cursor` RPC follows Connection’s authenticated trusted-host policy, including its Host/Origin checks and browser authentication. This plugin has no separate loopback or remote-management switch. For remote use, configure Connection’s trusted hosts; an SSH tunnel remains an option, for example `ssh -L 3080:127.0.0.1:3080 user@host`, then open `http://127.0.0.1:3080`.

## LLM Providers UI ownership

The **LLM Providers** Settings page (`settings.section` `id: providers` with child `settings.provider.item`) and the shared `llm-providers` order store are owned solely by `dsh-llm-providers-ui`.

- This plugin contributes only its keyed card (`key: llm-cursor`) and its Host `llm` route; it does not install the page or the shared `llm-providers` namespace. Load order with the owner does not matter.
- Without the owner (Headless or Web without `dsh-llm-providers-ui`): the Host model route `cursor` still works; in Web the Providers page and this card are omitted and the browser console warns that the owner is missing. The pack gate verifies that this plugin’s browser factory does not request or bundle the owner; Web composition remains a profile responsibility.
- The nav globe glyph is a temporary `Alpha.4` DOM adapter owned only by `dsh-llm-providers-ui` (`src/client/nav-icon.ts`); this plugin does not ship that adapter.

Install `dsh-llm-providers-ui` explicitly in the profile alongside provider plugins (see that package's `cordis.patch.yml`).

## License

MIT. The vendored AgentService protobuf binding is derived from [oh-my-pi](https://github.com/can1357/oh-my-pi) (MIT); see `NOTICE`.

## Release installation (Latest)

The release artifact follows the compatibility records above; it contains built Host/Client files only and has no sibling-repository source, workstation path, link:, or workspace: dependency.

The dsh-llm-providers-ui package owns the LLM Providers page, navigation, and shared order store. This package owns only its provider card, models, credentials, and Host route. Install the Owner first for Web; headless Host routing works without the Owner.

Latest (Owner + this plugin; required together on Web):

~~~sh
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/latest/download/dsh-llm-providers-ui-0.2.8.tgz
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-cursor/releases/latest/download/dsh-llm-cursor-0.2.22.tgz
~~~

Fixed versions (reproducible):

~~~sh
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/download/v0.2.8/dsh-llm-providers-ui-0.2.8.tgz
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-cursor/releases/download/v0.2.22/dsh-llm-cursor-0.2.22.tgz
~~~

Update, uninstall, and verify:

~~~sh
# Update Owner + this plugin to Latest
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/latest/download/dsh-llm-providers-ui-0.2.8.tgz
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-cursor/releases/latest/download/dsh-llm-cursor-0.2.22.tgz
# Verify the loaded version
dsh plugin --profile web list
dsh plugin --profile web doctor
# Uninstall only this plugin
dsh plugin --profile web remove dsh-llm-cursor
~~~

Configuration: use the plugin section in Settings for Web UI plugins, or the profile dsh.profile.bundles entry for Host-only plugins. Start with this README's minimal YAML/JSON example and provide credentials/backend addresses explicitly.

Rollback: rerun the fixed v0.2.22 command, verify the profile list, then restart the Web service once. Inspect journalctl --user -u dsh-web.service and dsh plugin --profile web doctor; never put a source checkout in the production profile.

Release and integrity: [v0.2.22](https://github.com/NOirBRight/dsh-llm-cursor/releases/tag/v0.2.22) · [SHA256SUMS](https://github.com/NOirBRight/dsh-llm-cursor/releases/download/v0.2.22/SHA256SUMS).
