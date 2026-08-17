# ADR 0001: Cursor CLI session entry, not completions

English | [中文](0001-cursor-cli-session-not-completions.zh.md)

## Status

Accepted — 2026-08-17

## Context

`dsh-llm-ollama` and `dsh-llm-grok` both chat through pi-ai:

- Ollama: OpenAI Chat Completions
- Grok: OpenAI Responses

Cursor's documented public APIs (Cloud Agents, `@cursor/sdk`) launch an agent that edits a repo. They are not a model-inference or chat-completions surface. A community request for `POST /v1/chat/completions` on `api.cursor.com` is still open.

oh-my-pi (`omp`) already uses Cursor as a model provider by talking to the same session entry the official Cursor CLI uses: Deep Control login, then HTTP/2 Connect + protobuf `AgentService/Run` on `api2.cursor.sh`.

DSH needs the first product: pick a Cursor model in the conversation picker and run the Harness agent loop (text, thinking, DSH function tools). A nested Cloud Agent would drop or fight those tools.

## Decision

1. Authenticate with the Cursor CLI Deep Control login (PKCE + poll). Do not use Dashboard `crsr_…` keys in V1. Do not call Cloud Agents `/v1/agents`.
2. Implement a first-party `CursorAdapter` that speaks Connect/protobuf. Do not wrap `PiAiAdapter`.
3. DSH remains the only tool executor. Cursor native exec is rejected in-stream. DSH tools are advertised as MCP tools. The primary path **parks the same Run and replies `mcpResult` on the next DSH turn** (same in-stream reply as omp). Rebuilding history into a new Run is the fallback when park misses.
4. Own the proto bindings and fake servers in this repo. Runtime does not depend on `@oh-my-pi/*`. oh-my-pi (MIT) is a protocol reference, not a vendored chat client.

## Consequences

- Chat works as a DSH model route, which is the only V1 that is worth shipping.
- The adapter is a protocol port, not a profile file. Client version pins and proto fields will break when Cursor ships a CLI that the pin no longer satisfies.
- HTTP/2 is required for `Run`. Discovery may use HTTP/1.1 unary. V1 does not ship a node/ALPN bridge.
- README must state this is a CLI-session compatibility constraint, not an official Cursor product integration and not an attempt to impersonate the Cursor CLI as a product.
- Cursor staff treat this class of private-client usage as a Terms of Service §1.5 violation, with account enforcement including ban. The plugin ships with that risk written in README and on the settings card. Official CLI / SDK / Cloud Agents remain rejected for V1 because they are a nested harness, not a DSH model route.

## Alternatives rejected

- **PiAiAdapter + invented completions URL.** No official completions URL exists.
- **`@cursor/sdk` / Cloud Agents as the chat backend.** Wrong abstraction: a second agent, not a model turn.
- **Depend on `@oh-my-pi/pi-ai` `streamCursor`.** Couples DSH message types, tool execution, and release cadence to omp.
- **Login-only V1.** A signed-in card that cannot chat is not a provider plugin.
