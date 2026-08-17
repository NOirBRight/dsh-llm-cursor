# ADR 0001: 走 Cursor CLI 会话入口，不走 Completions

[English](0001-cursor-cli-session-not-completions.md) | 中文

## 状态

提案 — 2026-08-17

## 上下文

`dsh-llm-ollama` 和 `dsh-llm-grok` 的聊天都交给 pi-ai：

- Ollama：OpenAI Chat Completions
- Grok：OpenAI Responses

Cursor 公开文档里的 Cloud Agents / `@cursor/sdk` 是启动一个会改仓库的 agent，不是模型推理或 chat-completions 面。社区要求 `api.cursor.com` 提供 `POST /v1/chat/completions` 仍是 feature request。

oh-my-pi（`omp`）已经把 Cursor 当成模型提供方：复用官方 Cursor CLI 的 Deep Control 登录，再对 `api2.cursor.sh` 打 HTTP/2 Connect + protobuf 的 `AgentService/Run`。

DSH 要的是第一种产品：对话 picker 里选 Cursor 模型，Harness agent loop 照常跑（文本、thinking、DSH function tools）。嵌一套 Cloud Agent 会丢掉或打架这些工具。

## 决策

1. 用 Cursor CLI 的 Deep Control 登录（PKCE + 轮询）。V1 不做 Dashboard `crsr_…` key，不打 Cloud Agents `/v1/agents`。
2. 自写 `CursorAdapter`，讲 Connect/protobuf。不包 `PiAiAdapter`。
3. 工具只由 DSH 执行。Cursor 原生 exec 在流内拒绝。DSH 工具按 MCP 广告。主路是 **同一条 Run 挂起、下一轮回 `mcpResult`**（与 omp 同流回包对齐）；历史回放新开 Run 只是 park 未命中时的回退。
4. proto 绑定和假服务器放在本仓库。运行时不依赖 `@oh-my-pi/*`。oh-my-pi（MIT）是协议对照，不是把聊天客户端整包搬过来。

## 后果

- 聊天是一条真正的 DSH 模型路由，这才是值得发的 V1。
- adapter 是协议移植，不是一份 profile。CLI 版本钉死值和 proto 字段会在 Cursor 发新 CLI 时裂开。
- `Run` 必须 HTTP/2。发现模型可以走 HTTP/1.1 unary。V1 不带 node / ALPN 桥。
- README 必须写明：这是 CLI 会话兼容约束，不是官方 Cursor 产品集成，也不是把本插件宣传成官方 CLI。

## 否决的替代

- **PiAiAdapter + 臆造的 completions URL。** 没有官方面。
- **`@cursor/sdk` / Cloud Agents 当聊天后端。** 抽象错了：那是第二个 agent，不是一轮模型。
- **依赖 `@oh-my-pi/pi-ai` 的 `streamCursor`。** 把 DSH 的消息类型、工具执行和发版节奏绑到 omp 上。
- **只做登录的 V1。** 登得上却不能聊，不算提供方插件。
