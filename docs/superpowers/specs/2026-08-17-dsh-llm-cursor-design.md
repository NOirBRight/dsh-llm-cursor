# dsh-llm-cursor 设计

日期：2026-08-17  
状态：起草，待讨论通过

第三方 DeepSeek Harness 插件：用 Cursor 订阅登录（Deep Control，与官方 CLI 同款会话入口），在 DSH 对话里选 Cursor 模型聊天。DSH 仍是唯一的 agent loop 与工具执行方。不做 Dashboard `crsr_…` API key。不替代、也不调用官方 Cloud Agents / `@cursor/sdk`。

协议决策见 [ADR 0001](../../adr/0001-cursor-cli-session-not-completions.zh.md)。登录与聊天必须同一份 V1 交付；只登录不能聊不算提供方插件。

对照实现（公开源码，MIT）：[oh-my-pi](https://github.com/can1357/oh-my-pi) 的 `packages/ai/src/registry/oauth/cursor.ts`（登录）与 `packages/ai/src/providers/cursor.ts`（`AgentService/Run`）。本仓库自持 proto 与 adapter，运行时不依赖 `@oh-my-pi/*`。

## 1. 产品范围

### V1 做

- 本机浏览器 Deep Control 登录 / 登出（PKCE + 轮询，无本机 callback）
- 插件自管会话与 refresh（不读、不写 `~/.cursor` 或官方 CLI 凭据文件）
- 冻结 catalog 作冷启动；登录后用 `GetUsableModels` 刷新，最后一次成功结果写入 settings
- 自写 `CursorAdapter`：HTTP/2 Connect + protobuf `AgentService/Run`
- 流式文本、thinking、DSH function tools（MCP 广告；**优先同 Run 回 `mcpResult`，回放只作回退**）
- 协议保活：5s heartbeat、KV `getBlob`/`setBlob`、等到 `turnEnded` 才算成功
- Plugin 卡展示额度（Host 读 usage，浏览器不碰 token）

### V1 不做

- Dashboard `CURSOR_API_KEY` / `crsr_…` 登录或回退
- Cloud Agents `/v1/agents`、`@cursor/sdk`、`agent acp`
- 依赖 `@oh-my-pi/pi-ai` 或把 omp 的 `cursor.ts` 整文件搬进本仓库
- `ctx.web` search / fetch 提供方（Fetch 继续用 DSH 内置 HTTP）
- 在 adapter 内执行 Cursor 原生工具（`bash` / `read` / `write` / `grep` / `delete` / `ls` / `lsp` / `todo`）
- 用户可改的 chat base URL、CLI 版本、或「伪装成官方 CLI 产品」的开关
- ALPN / 公司代理的 HTTP/2 桥（失败时给明确错误，不在 V1 修传输）
- Device-code、复用本机已登录的 Cursor IDE 会话

以后若加 `crsr_…` 换票、catalog 手改、usage 字段细化，只动对应模块，不改 provider id 与 settings namespace。

## 2. 身份与安装面

| 项 | 值 |
|---|---|
| 包名 | `dsh-llm-cursor` |
| Cordis 插件名 | `llm-cursor` |
| Provider 路由 | `cursor` |
| Settings namespace | `llm-cursor` |
| 展示名 | Cursor |
| 登录页 | `https://cursor.com/loginDeepControl` |
| 轮询 / 换票 | `https://api2.cursor.sh/auth/poll`、`https://api2.cursor.sh/auth/exchange_user_api_key` |
| 聊天 | HTTP/2 `POST https://api2.cursor.sh/agent.v1.AgentService/Run`（Connect + proto） |
| 模型目录 | unary `POST …/agent.v1.AgentService/GetUsableModels` |
| 额度 | `GET https://api2.cursor.sh/auth/usage`；OAuth 时再读 `https://cursor.com/api/usage-summary` 与 `/api/auth/me` |

DSH 没有内置 `cursor` 路由，不存在 grok / `xai` 那种撞车。

包结构对齐 `dsh-llm-grok`：`src/` + `src/client/`，导出 `.`、`./client`、`./invariant`，`dsh.client.inject` 与 grok / ollama 同套 Web 客户端依赖。安装方式同样是 GitHub 源上带构建产物：`dsh plugin --profile web add github:…`。

`peerDependencies` **不**包含 `@deepseek-ai/dsh-llm-pi-ai`。聊天不走 pi-ai。仍依赖 `@deepseek-ai/dsh-llm` 的 `LlmAdapter` / `StreamChunk`。

## 3. 为何不走 Models 页

与 grok 相同。DSH Models 页编辑器只手写 `llm-deepseek`、`llm-pi-ai`。其它 namespace 打开是 hint，Apply 禁用，没有 OAuth、没有模型清单、没有额度。

对话里的模型选择器走 `registerAdapter` → `listModels()`，与 Models 页编辑器无关。

因此：

- 登录、额度、catalog **展示** 全部在 Settings → Plugins → Plugin configuration。
- `registerAdapter(['cursor'], adapter)`：picker 能选模型。
- `registerConfigurableProviders([{ provider: 'cursor', displayName: 'Cursor', settingsNs: 'llm-cursor', settingsPath: [] }])`：Models 页可以有一行，点进去不能配。
- **不**声明 `apiKeyEnv`，避免该行出现「缺 API key」红点（订阅会话不是 API key）。

## 4. 模块

| 模块 | 职责 |
|---|---|
| `oauth.ts` | Deep Control PKCE、轮询、`exchange_user_api_key` refresh |
| `session.ts` | 会话读写；仅 Host |
| `adapter.ts` | `CursorAdapter extends LlmAdapter`：`listModels` / `resolveModel` / `stream` |
| `run.ts` | 一次 `GenerateOptions` → 一次 `Run`（或接上挂起的 Run）：组请求、读 Connect 流、映到 `StreamChunk` |
| `park.ts` | 按 `sessionId` 挂起未结束的 HTTP/2 Run，等下一轮 DSH tool result 回 `mcpResult` |
| `history.ts` | DSH `messages` + `system` → Cursor `conversationState` / `rootPromptMessagesJson` / `turns` / 当前 `action` |
| `exec.ts` | exec 握手：`requestContext`、KV blob、原生 exec 拒绝、MCP probe / invocation |
| `interaction.ts` | `textDelta` / `thinkingDelta` / `toolCall*` / `tokenDelta` / `turnEnded`；`args_text_delta` 按累计快照削前缀 |
| `wire/` | Connect 帧、HTTP/2 客户端、本仓库生成的 agent proto 绑定 |
| `catalog.ts` | 冻结种子 + `GetUsableModels` + settings 里最后一次成功目录 |
| `usage.ts` | 读 usage / usage-summary，解码成卡上视图 |
| `client-contract.ts` | 常量、JSON 解码、RPC 形状（Host/Client 共享，无密钥） |
| `index.ts` | 注册 adapter、settings、RPC |
| `client/` | Plugin 卡 |

`wire/` 对照 omp 已公开的帧格式与 proto 字段实现，用假服务器锁回归。不要把 omp 的 2800 行 provider 复制进来；按 DSH `StreamChunk` 重写。

## 5. 登录与会话

### 流程

1. 卡上「用 Cursor 登录」→ loopback RPC `auth/start`。
2. Host 生成 PKCE S256（`verifier` / `challenge`）和一个 `uuid`，打开系统浏览器到 `loginDeepControl`，查询参数：`challenge`、`uuid`、`mode=login`、`redirectTarget=cli`。
3. Host 轮询 `auth/poll?uuid=…&verifier=…`。未完成是 404，指数退避，上限约 150 次 / 两分半（与 omp 同量级，实现时钉死常量）。
4. 成功 JSON 含 `accessToken`、`refreshToken`。access token 是 JWT；`expiresAt` 取 `exp` 提前 5 分钟。`userId` 从 JWT `sub` 解析（`provider|id` 时取后段）。能读到 email 则写入会话（额度路径的 `/api/auth/me` 也可回填）。
5. 用户取消、超时、或连续传输失败：不写半截会话，RPC 回可重试失败。
6. `auth/status` 只回 `{ loggedIn, email?, expiresAt? }`。
7. `auth/logout` 删除会话文件。

没有本机 callback，也没有 paste-code。Client 只发起与展示状态。Token 不进浏览器、不进 settings、不进日志。

### 存储

会话文件：`$DSH_HOME/cursor-oauth.json`，权限 `0600`。内容为 access token、refresh token、expiry、账号标识（email / user id，有则存）。

刷新：每次聊天、拉目录或读额度前，若即将过期则 `POST auth/exchange_user_api_key`（`Authorization: Bearer <refresh>`，空 JSON 体）。请求 401 再 refresh 一次后重试。refresh 失败 → 清会话，聊天报 `AUTH`，卡上回到未登录。

不读、不写 `~/.cursor`、`~/.config/cursor`、官方 CLI 的 auth 文件。

### 与 grok 登录的差别

| | grok | cursor |
|---|---|---|
| 完成方式 | `127.0.0.1` callback（另有 paste-code） | 打开 Deep Control 后 poll |
| 换票 | IdP token endpoint | `exchange_user_api_key` |
| 环境变量兜底 | 无 | 实现与测试可认 `CURSOR_ACCESS_TOKEN`；卡上不提供粘贴框 |

V1 卡上只有「登录 / 登出」。不提供粘贴 `crsr_…` 或 access token 的输入。测试可用环境变量注入，不经过 RPC。

## 6. 聊天

这是 V1 的主路径。没有这条，登录没有产品意义。

### 6.1 适配器形状

`CursorAdapter` 直接实现 `LlmAdapter`：

- `providerInfo` / `providerRetryPolicy`：本插件的 retry 与展示名
- `listModels`：当前 catalog（settings 里最后一次成功目录，否则冻结种子）
- `resolveModel`：catalog 命中才接受；带上 context / reasoning / vision 旗标
- `stream(options)`：`ensureFreshSession` → 组 Run → 映 `StreamChunk`

不委托 `PiAiAdapter`。`GenerateOptions.stop` 不支持，忽略并打 debug 日志，与当前 pi-ai 插件一致。

### 6.2 DSH 一轮 vs Cursor 一条 Run（对照 omp 后的改法）

DSH 的 `LlmAdapter.stream()` 仍是 **一轮模型**：吐文本 / thinking / tool-call，然后把控制权交回 Harness。omp 则在 **同一条 Run** 里执行工具并回 `mcpResult`，一直等到 `turnEnded`。

对照 omp 之后：**不要**在收到第一个 `mcpArgs` 时 RST 掉 HTTP/2。对端在等 `mcpResult`；硬关会导致 args 没收齐、没有 `turnEnded`、会话被标脏（omp #8345：`resource_exhausted` + 零 token = 这条 conversation 毒掉）。

V1 分两路，优先走 omp 同款的同流回包：

```
DSH GenerateOptions
  → 若 park.ts 里有本 session 的挂起 Run，且本轮 messages 尾部 tool result
    的 callId 正好覆盖挂起的 MCP 调用
        → 在同一条 HTTP/2 上逐条回 mcpResult（成功/失败按 DSH isError）
        → 继续读流：更多文本 / 更多 MCP / turnEnded
  → 否则开新 Run（历史从 DSH messages 重建）
  → 流式 text / reasoning
  → MCP invocation：等 interaction 上的 toolCallCompleted 收齐参数，
    写成 DSH tool-call，**挂起 Run（心跳继续），本轮 stream 结束**
  → DSH 执行工具，下一轮走上面的 park 命中
```

挂起失败（进程重启、idle 超时、callId 对不上、用户取消）：关掉旧 Run，下一轮走历史回放新开 Run（`resumeAction` + turns 里带 tool result）。回放是回退，不是主路。

adapter **仍不执行**任何工具。`sessionId` → Cursor `conversationId`（进程内映射；没有就新 UUID）。历史重建规则不变：checkpoint 不当权威历史。

`park.ts` 在挂起期间继续 5s heartbeat，并把静默算成本地等待（对照 omp `stream.trackLocalWork` / #4593），避免 `streamIdleTimeoutMs` 把「DSH 正在跑工具」当成提供方卡死。取消或超时：关流、清 park，不写半截会话。

### 6.3 请求体（概念，不是字段清单）

`AgentClientMessage.runRequest` 至少包含：

- `conversationId`
- `conversationState`：`rootPromptMessagesJson`（system + 此前消息的 blob 引用）+ `turns`（此前的 user / assistant / tool 回合）
- `action`：有新用户可见输入时用 `userMessageAction`；本轮只回放 tool result、没有新 user 文本时用 `resumeAction`（对照 omp：resume 必须保留尾部 tool result）
- `modelDetails` / `requestedModel`：catalog 的 wire id；该行若带 `maxMode` 则两处都带上

system prompt：`GenerateOptions.system` 编进 `rootPromptMessagesJson` 头部。空 system 时对照 omp 落一条 `"You are a helpful assistant."`，避免对端拿到空 prompt 头。不设 `customSystemPrompt` 覆盖，除非实现时核对 Run 没有 system 槽、必须走该字段。

user 消息的 `messageId` 用确定性 UUID（内容 + 轮次），不要每轮随机；omp 靠这个保持服务端前缀稳定。

图片：有则走 `selectedContext.selectedImages`（可内联 bytes，与 omp `createCursorUserMessage` 一致），同时按 sha256 进 blob store 供 KV 回取。没有图片就只发文本。`resolveAttachments` 与 grok/ollama 一样在请求时解析。

### 6.4 传输与身份头

- 基址：`https://api2.cursor.sh`（源码常量，settings 不可改）
- 协议：HTTP/2，`content-type: application/connect+proto`，`connect-protocol-version: 1`
- `Authorization: Bearer <accessToken>`
- 兼容头（与 grok 的 426 路径同类，V1 必须带，否则对端不接）：
  - `x-cursor-client-type: cli`
  - `x-cursor-client-version`：源码常量，实现时按当前能打通的官方 CLI 版本钉死
  - `x-ghost-mode: true`（本进程不执行 Cursor 工作区工具）
  - `X-Dsh-Plugin: dsh-llm-cursor/<version>`
- `x-request-id`：每轮新 UUID

README 写明：这些头是让会话入口接受请求的兼容约束，不是把本插件宣传成官方 Cursor CLI。版本常量变更记 changelog，不做成卡上输入。

HTTP/2 建连失败（含 ALPN 被剥）：`SERVER` 或专用传输码，文案说明需要到 `api2.cursor.sh` 的 HTTP/2，不在 V1 做桥。

### 6.5 三条信道（omp 实际是这样拆的）

`AgentServerMessage` 不是单一聊天流。omp 的 `handleServerMessage` 分四支，V1 都要接：

| case | 作用 | V1 |
|---|---|---|
| `interactionUpdate` | 文本 / thinking / 工具公告 / `tokenDelta` / `turnEnded` | 映到 `StreamChunk`；**DSH tool-call 以这条为准** |
| `execServerMessage` | 对端等本机回包 | 见下表；**不**用它当 tool-call 的参数源 |
| `kvServerMessage` | `getBlob` / `setBlob` | **必须回**。历史和图片都是 blob id，不回则 Run 组不出 prompt |
| `conversationCheckpointUpdate` | 服务端回写 state | 缓存非历史字段（todos / fileStates）；`rootPrompt` / `turns` 仍以 DSH messages 为准。`tokenDetails.usedTokens` 在还没见到 `tokenDelta` 时记为 input/context |

另：每 5s 写一帧 `clientHeartbeat`。trailers 里 `grpc-status !== 0` 当提供方错误。读循环 fire-and-forget 分发，但 `finish` / 抛错前必须 `await` 未完成的 exec/KV（omp：否则 tool 对不上、历史重建会丢掉该调用）。

没有 `turnEnded` 就结束的 HTTP/2：按 omp 算不完整流，不能当成功 `stop`。

#### exec 表

广告 MCP 时 `providerIdentifier` 与历史回放必须同一常量（建议 `dsh-llm-cursor`，不要抄 omp 的 `pi-agent`）。过滤原生同名：`bash`、`read`、`write`、`delete`、`ls`、`grep`、`lsp`、`todo`。

| 服务端帧 | V1 行为 |
|---|---|
| `requestContextArgs` | 回带 DSH 工具的 context |
| `getBlobArgs` / `setBlobArgs` | 从本轮 blob store 读写并回结果；缺 blob 回空，不抛到 DSH |
| MCP **approval probe** | 工具名在本轮 `tools` 里 → approved；否则 rejected。不执行、不合成 DSH tool-call（omp：probe 执行会副作用打两遍） |
| MCP **invocation**（`mcpArgs`） | **先不回 `mcpResult`**。记下 `execId` + `toolCallId`。DSH tool-call 等 interaction 的 `toolCallCompleted`（参数以累计 `args_text_delta` 为准）。本轮 stream 结束后 Run **挂起**；下一轮 park 命中再回 `mcpResult` |
| 原生 exec（`piRead` / `piBash` / `piWrite` / `piGrep` / `piLs` / `piEdit` / `delete` / `lsp` / shell stream…） | 立即 rejected。interaction 上对应的 `pi_*_tool_call` **不要**再合成 DSH tool-call（omp：`isExecOwnedToolCall`，否则一块变两块） |
| 服务端自决：`todo` / `connect_scm` | interaction 上可能出现。**不要**交给 DSH 执行。不合成 DSH tool-call；本地 squelch。`connect_scm` 没有 exec case，只能忽略完成帧 |
| `listMcpResources*` / `readMcpResource*` | 空成功，不合成 tool-call |
| 其它未识别 exec | rejected，不执行 |

并行：用 interaction **信封** `call_id` 做 open-block 索引，不要用「当前唯一 tool-call」槽。信封 id 与 MCP `args.toolCallId` 可以不是同一个（omp 为此专门拆了两套 key）。

收齐：至少一个 MCP `toolCallCompleted`，且没有仍在增量的 MCP 块，再结束本轮 DSH `stream` 并挂起。**禁止**「静默几百毫秒就关」的启发式——那会在累计 args 截断处切掉。

`resource_exhausted` 且本轮 `tokenDelta` 为 0：按 omp #8345 **轮换** `conversationId`（只轮一次），下次新 Run 用新 id。这是会话毒掉，不是账号额度用尽。

结束原因：

- `turnEnded` 且本轮无未回的 MCP → `stop`（或对端完成原因）
- 本轮挂起等 DSH 工具 → tool-calls 完成原因
- 调用方 `signal` 取消 → 清 park，中止 Run

### 6.6 流映射

| Cursor 流 | DSH `StreamChunk` |
|---|---|
| `textDelta` | `block-start(text)` / `text-delta` / `block-end` |
| `thinkingDelta` / `thinkingCompleted` | `block-start(reasoning)` / `reasoning-delta` / `block-end` |
| MCP `toolCallStarted` / `toolCallDelta` / `partialToolCall` / `toolCallCompleted` | `tool-call-*`（`arguments` 仍是原始 JSON 字符串） |
| `tokenDelta` | 累加 **output**；`usage` 在 `finish` 前发 |
| checkpoint `usedTokens` | 仅当还没有 `tokenDelta` 时记 **input/context** |
| `turnEnded` 或本轮挂起 | `finish` |

`args_text_delta` 是 **累计快照**（omp 对 `agent.proto` 的注释）。已有前缀则只追加后缀；对不上前缀则整段当新片段。中途 parse 要节流，权威 JSON 在 `toolCallCompleted`。

block index 在本轮内从 0 递增，交错 delta 用同一 index。adapter 可以抛错；`LlmRuntime.stream()` 会收成终端 `error` / `aborted`。

`replayState`：V1 可省略。历史重建不依赖 Cursor checkpoint。

### 6.7 历史重建

`history.ts` 是聊天正确性的核心，必须有单测。

- `system` → `rootPromptMessagesJson` 头部 blob
- 此前的 user / assistant / tool 消息 → `turns` **以及** `rootPromptMessagesJson` 的后续项（omp：服务端用 `rootPromptMessagesJson` 组模型 prompt，只发 turns 会丢多轮上下文）
- 本轮最后一条 user（有文本或图）→ `userMessageAction`，不进入「此前」turns
- 本轮若以 tool result 结尾、没有新 user 文本 → `resumeAction`，turns 含那些 tool result
- assistant 消息保留 provider 发出的 tool-call id，tool result 用同一 `callId` 回放；**空 result 也要写**（omp：丢掉会对不上，重建历史时整段调用被剥掉）
- 对不上任何 assistant tool-call 的 tool result：降级成 assistant 文本 `[Tool Result]` / `[Tool Error]`，不要丢
- thinking / reasoning：仅当历史 assistant 的 provider+model 与本轮相同才写回 `thinkingMessage`；换模型则省略，不要漏进文本
- 不把 Cursor 原生 / 服务端自决工具（`todo`、`connect_scm`、`pi_*`）写进 DSH 历史

进程内按 `sessionId` 缓存 blob store / conversationId / 挂起 Run。缓存与当前 messages 对不上就整表重建并放弃 park。

### 6.8 推理档位

`GetUsableModels` 的每条 `ModelDetails` 带 `maxMode`。catalog 行要保住这个旗标。

`GenerateOptions.reasoningEffort`：

- 模型 `maxMode === true` 且 effort 是 `high` / `max`（实现时对 DSH 的 `ReasoningEffortId`）→ 请求里 `maxMode: true`
- 其它 effort 或模型没有 maxMode → `maxMode: false`，不发明其它 thinking 字段
- `resolveModel` 只在 `maxMode` 模型上暴露 effort 选择；默认不强制 max

实现时若对端还要单独的 thinking 字段，只在假服务器与一次实网核对后追加，不在 V1 猜。

## 7. Catalog

冻结种子保证未登录或发现失败时 picker 仍有行。登录后 `GetUsableModels` 覆盖 settings 里的 `models`。

种子在实现时按当时能打通的 id 填写，至少包含一条当前订阅稳定存在的 thinking 模型（预期是 Composer 家族；**以实网 `GetUsableModels` 为准**，本文不把过期 id 写死）。每条：

| 字段 | 含义 |
|---|---|
| `id` | wire model id |
| `name` | picker 标签 |
| `thinking` | 是否当 reasoning 模型 |
| `vision` | 是否接受 image 块 |
| `maxMode` | 请求是否允许 `maxMode` |

发现失败：保留上一份成功目录；从未成功则用种子。不把空目录写成「账号没有模型」。

`listModels()` 只返回当前目录。不在目录里的 id，`resolveModel` / `stream` 拒绝（与 ollama 现行行为一致，不做 pass-through）。

Plugin 卡只读展示当前目录（id、能力旗标）。用户在对话 picker 里选模型。档位不够用某模型时，把提供方错误原样交给 DSH，卡上不预判档位。

卡上不提供拖拽编辑目录（那是 ollama 的发现 UX）。Cursor 目录以账号可用集为准。

## 8. 额度

卡上独立一节，对标 `dsh-llm-ollama` / grok 的 usage。

- RPC `usage/read`。未登录不打网，回未登录。
- Host 用当前 access token：
  1. `GET {api2}/auth/usage`
  2. 若有 `userId`，再读 `cursor.com/api/usage-summary` 与 `/api/auth/me`（session cookie 的拼法对照 omp `usage/cursor.ts`：`userId::accessToken`；实现时按对端现行格式，测假服务器）
- 解码成卡上窗口：Cursor Models / Other Models / On-Demand / 请求次数（有哪个用哪个）。`maxRequestUsage: null` 时仍展示已用，上限标为不限，**不要**整份 usage 丢掉（omp #6381）。
- 浏览器只收已解码视图，永不收 token。
- 有数据：用量条。两个面都没有可用窗口：`unsupported`，不是错误。传输失败才是错误。

## 9. RPC

Channel：`/cursor`，`authority: 'loopback'`。

| endpoint | 作用 |
|---|---|
| `auth/start` | 开始 Deep Control + 轮询（阻塞到成功、取消或超时） |
| `auth/status` | 登录态，无密钥 |
| `auth/logout` | 清会话 |
| `usage/read` | 额度快照或 unsupported |
| `models/list` | 已登录则刷新 `GetUsableModels` 并回目录；未登录回种子 |

载荷用 `client-contract.ts` 的解码函数校验。未知 endpoint 回内部错误。Token 形字段出现在 RPC 载荷里一律失败（与 grok 相同）。

`auth/start` 在 Host 上阻塞到 poll 结束。卡上展示「正在登录…」。用户关浏览器则等超时，不写会话。

## 10. Settings

`installSettingsSection` 挂 `llm-cursor`。V1 节：

- `streamIdleTimeoutMs` 默认 300000
- `retryPolicy` 用 DSH 普通默认
- `models`：最后一次成功的 catalog（发现写入；卡上只读）

没有 `apiKeyEnv`，没有用户可改的 baseURL 或 client version。

## 11. 错误

| 情况 | 结果 |
|---|---|
| 未登录就聊 | `MISSING_CREDENTIAL` |
| refresh 失败 / 会话作废 | `AUTH`，卡上未登录 |
| Deep Control 取消或 poll 超时 | 卡上可重试，无会话文件 |
| HTTP/2 / ALPN 失败 | 传输错误，文案点明 HTTP/2，无密钥 |
| 额度无此面 | unsupported，非错误 |
| 额度传输失败 | 卡上错误文案，无密钥 |
| 模型不在目录 | `INVALID_REQUEST` |
| 模型档位不够 / 对端 4xx | 提供方错误原样上抛（401/403 → `AUTH`，429 → `RATE_LIMIT`） |
| 原生 exec 被拒后对端仍失败 | 提供方错误上抛，不降级成本地工具执行 |

日志与错误细节不得包含 access token、refresh token、authorization 头、session cookie。

## 12. 测试

不打真实 Cursor。本地假服务器覆盖：

**登录**

- poll 404 若干次后成功；写入文件权限 `0600` 与字段
- poll 超时不写文件
- refresh：过期先刷；401 刷一次再重试；刷失败清会话
- JWT `exp` / `sub` 解析

**聊天（V1 必过，否则不能合）**

- 发出的 Run：`ghost-mode`、插件身份头、目录内 model id、`rootPromptMessagesJson` 含 system + 此前 user/assistant
- 多轮：第二轮请求的 state 含第一轮 assistant 文本
- 文本流 → `text-delta` + `finish`
- thinking 流 → `reasoning-delta`
- `requestContext` 回包含 DSH 工具、不含原生工具名
- KV `getBlob`：假服务器要 blob，adapter 回得上先前写入的 system/user bytes
- 5s 内至少一帧 heartbeat（测试把间隔调短）
- `args_text_delta` 累计快照：第二帧是第一帧的前缀扩展，DSH arguments 不得重复前缀
- MCP invocation → 等 `toolCallCompleted` 后才有完整 DSH tool-call；本轮 **不关** HTTP/2，Run 进 park
- 下一轮带匹配的 tool result → **同一条**流上出现 `mcpResult`，然后 `turnEnded`
- park 未命中（换 session / callId 对不上）→ 新 Run + `resumeAction`，turns 里能看到该 `callId`；空 tool result 也在
- 原生 `bash` / `piBash` exec → 假服务器收到 rejected，adapter **零**次本机命令，也 **零**个 DSH tool-call
- interaction 上的 `todo` / `connect_scm` → 不合成 DSH tool-call
- MCP approval probe → 不执行、不合成 tool-call
- 两个并行 MCP（两个信封 `call_id`）→ 两个 DSH tool-call 后挂起，互不串参
- `resource_exhausted` + 零 token → 下一次请求换了 `conversationId`
- 未登录 stream → `MISSING_CREDENTIAL`
- 取消 `signal` → 清 park，不留下半截会话文件变更

**目录与额度**

- `GetUsableModels` 成功写入 settings；失败保留上一份
- 额度：正常窗口 / `maxRequestUsage: null` 仍展示 / unsupported / 未登录不请求

**Client**

- 未登录 / 登录中 / 已登录 / 额度四种状态
- catalog 只读

`pnpm run check` = `build` + `test` + `pack:check`（pack 清单对齐 grok：`lib/`、`cordis.patch.yml`、README）。

假 `Run` 服务器必须讲 Connect 帧，不能只断言「adapter 被调用」。这是聊天测的最低线。

## 13. 非目标（防止回潮）

- 不把 Cursor 原生工具接到 DSH `ctx` 或本机 shell，即使「ghost-mode 偶尔仍弹出 bash」。
- 不在 adapter 里 **执行** MCP 工具。可以在同一条 Run 上回 DSH 已经算好的 `mcpResult`（这是 omp 同流回包，不是第二个 loop）。
- 不在收到第一个 `mcpArgs` 时 RST HTTP/2。
- 不在 Models 页做 OAuth 或 catalog 编辑。
- 不把订阅会话当官方 Cloud Agents key 打 `api.cursor.com/v1/agents`。
- 不在 V1 做 usage 的计费跳转，除非响应当场带了无密钥的官方 URL。
- 不把 `x-cursor-client-version` 做成用户配置。
- 不把本插件描述成官方 Cursor 产品或官方 CLI。

## 14. 实现顺序

聊天与登录同一里程碑，但可以按这个顺序写，每步都有假服务器绿：

1. `client-contract` + `session` + `oauth` + 假 poll / exchange
2. `wire/` Connect 帧 + 假 `Run` / `GetUsableModels`
3. `history` + `exec` + `interaction` + `park` + `run` + `adapter`（先文本 + KV + heartbeat，再 MCP park，再 park 未命中回退）
4. `catalog` + `usage` + `index` RPC
5. Plugin 卡
6. `pack:check` 与 README（含兼容约束说明）

第 3 步没绿，不开始第 5 步。

## 15. 对照 omp：Agent 侧差在哪

omp 的 `cursor.ts` 身兼 **协议客户端 + agent loop**。DSH 只要协议客户端；loop 在 Harness。下面是对照后写进第 6 节的修正，按严重程度排。

| omp 实际做法 | 原稿 | 现在 |
|---|---|---|
| 同流执行工具并回 `mcpResult`，等到 `turnEnded` | 第一个 MCP 就 RST Run，靠下一轮历史回放 | **挂起 Run，下一轮回 `mcpResult`**；回放只是回退 |
| `kvServerMessage` 回 get/set blob | 没写 | V1 必做，否则历史 blob 取不回 |
| 5s `clientHeartbeat` | 没写 | V1 必做 |
| 没有 `turnEnded` = 不完整流 | HTTP/2 结束就算成功 | 必须见到 `turnEnded` 或显式取消 |
| `args_text_delta` 是累计快照 | 当增量 | 削前缀；权威 parse 在 `toolCallCompleted` |
| 信封 `call_id` ≠ MCP `toolCallId`；并行用信封索引 | 「当前 tool-call」+ 静默启发式 | 两套 key；禁止静默关流 |
| `pi_*` 由 exec 拥有，interaction 公告不建第二块 | 可能把原生公告建成 DSH tool-call | exec 拒，interaction 忽略 |
| `todo` / `connect_scm` 服务端自决，不进本地 loop | 只过滤了广告名 | 不合成 DSH tool-call |
| MCP probe 绝不执行 | 已写 approved/rejected | 保持 |
| `resource_exhausted` + 零 token → 轮换 conversationId（#8345） | 没有 | 只轮一次 |
| 空 tool result 也回放；对不上的 result 变 assistant 文本 | 只说保留 callId | 空也写；孤儿 result 降级文本 |
| thinking 按同模型才回放（kimi-k3） | 没写 | 同 provider+model 才写 `thinkingMessage` |
| user `messageId` 确定性 UUID | 没写 | 内容+轮次哈希 |
| `providerIdentifier: "pi-agent"` 广告与历史一致 | 没写 | 用 `dsh-llm-cursor`，两处同一常量 |
| `tokenDelta` = output；checkpoint `usedTokens` = context | 「完成帧 usage」 | 拆开 |
| exec 期间 idle 不算卡死（#4593） | 可能被 `streamIdleTimeoutMs` 打死 | park / exec 算本地等待 |
| 分发异步，结束前 drain | 没写 | `finish` 前 await 未完成 KV/exec |
| gRPC trailers | 没写 | `grpc-status !== 0` 当错误 |

保持不变、且对照后仍正确的：ghost-mode、不执行原生工具、不依赖 `@oh-my-pi/*`、checkpoint 不当历史权威、`rootPromptMessagesJson` 与 `turns` 都要从 DSH messages 建。
