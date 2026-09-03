# dsh-llm-cursor

[English](README.md) | 中文

DeepSeek Harness 的**非官方** Cursor 订阅登录与聊天插件。独立提供方路由 `cursor`、设置命名空间 `llm-cursor`。**不**隶属于 Anysphere / Cursor，**不是**官方 Cursor CLI，也不调用官方 Cloud Agents 或 `@cursor/sdk`。

> **封号风险，先读这一段。** Cursor 员工把这类私有客户端用法视为违反服务条款。**Cursor 账号可能被限制或永久封禁。** 安装、登录、发一条对话都算使用。这不是擦边球；只在本机跑也不能保护账号。详见 [风险与服务条款](#风险与服务条款)。

包根导出 Cordis 插件契约。同一产物的 `./client` 在 Settings → LLM Providers 下贡献 Cursor 卡。

## 安装

本版本目标为 DeepSeek Harness 0.1.2-alpha.4，与 Alpha.1–Alpha.3 不兼容。从 GitHub 安装。装完再登录，走的就是同一套非官方会话，上面的封号风险立刻适用。仍使用 Alpha.1–Alpha.3 的用户应继续保留最后一个 Alpha.1 兼容版本，不要安装本版本：

~~~sh
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/download/v0.1.3/dsh-llm-providers-ui-0.1.3.tgz
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-cursor/releases/download/v0.2.15/dsh-llm-cursor-0.2.15.tgz
dsh web
~~~

仓库跟踪已构建的 lib 产物，GitHub 安装不需要允许构建脚本。源码检出可在 `pnpm run build` 后用 link 安装。

## Web 配置

打开 Settings → LLM Providers → Cursor。卡上的副标题就是上面那句警告：非官方私有接口；Cursor 员工视为违反 ToS；**账号可能被封**。

![Cursor 插件卡：ToS 警告、登录、额度、已保存目录](docs/screenshots/plugin-card.png)

**用 Cursor 登录**会在 Host 上走 Deep Control PKCE（与官方 CLI 同一会话入口），打开系统浏览器并轮询到完成。会话只存在 Host 的 `$DSH_HOME/cursor-oauth.json`（权限 `0600`）。能读到邮箱则显示。登出删除该文件。浏览器永远收不到 token。

本插件**不**读、不写 `~/.cursor` 或官方 CLI 凭据。卡上没有粘贴码，也没有 Dashboard `crsr_…` API key 登录。

登录后点 **获取可用模型**，用 `GetUsableModels` 拉账号目录。Cursor 把每个思考等级 SKU 都列成独立 id；插件会收成一个模型族，对话里的思考等级再映射回对应 wire id。Fast 仍是独立模型，紧挨在对应标准版后面。只有 Cursor 真正提供 Max Context 的家族，Fetch 才会多一行 `-1m`（例如 `claude-opus-5-1m`），Composer / Cursor Grok 不会。保存只留下你勾选的行，不会把未勾选的 Max 再加回去。你可以再排序、改名、改能力旗标。对话选择器使用这份已保存目录。

![获取目录：勾选要保留的模型族](docs/screenshots/catalog-picker.png)

![保存目录后，对话里的模型选择器](docs/screenshots/chat-model-menu.png)

聊天走 HTTP/2 Connect+protobuf `POST https://api2.cursor.sh/agent.v1.AgentService/Run`。DSH 仍是唯一的 agent loop 与工具执行方。登录后卡上还会展示额度（Cursor Models / Other Models；On-Demand 仅在有用量或上限时显示）。未登录不打额度网；对端没有可用窗口是 unsupported，不是错误。

未登录聊天失败码 `MISSING_CREDENTIAL`。已有会话但 refresh 失败会清会话，失败码 `AUTH`。

## 兼容头

Cursor 会话入口目前要求 CLI 形态的请求头。本包发送：

- `x-cursor-client-type: cli`
- `x-cursor-client-version: cli-2026.01.09-231024f`（源码钉死；变更记 changelog）
- `x-ghost-mode: true`（本进程不执行 Cursor 工作区工具）
- `X-Dsh-Plugin: dsh-llm-cursor/<version>`
- Harness 的 `attributionHeaders()`

这些头是让会话入口接受请求的兼容约束，不是把本插件宣传成官方 Cursor CLI。

需要到 `api2.cursor.sh` 的 HTTP/2（含 ALPN）。V1 不做代理桥；传输失败的文案会点明 HTTP/2。

## 风险与服务条款

**这可能导致 Cursor 账号被封。** 登录成功、对话能发、额度条很低，都不等于被允许。

本插件打的是 **Cursor 私有客户端接口**，和 Oh My Pi 的 `cursor` 提供方同一类非官方用法：Deep Control PKCE 登录，再对 `api2.cursor.sh` 打 HTTP/2 Connect+protobuf 的 `AgentService/Run` 与 `GetUsableModels`，额度走 dashboard 轨道。

Cursor 员工已说明，这类工具违反 [Cursor 服务条款](https://cursor.com/terms-of-service) §1.5（除官方客户端外访问服务 / 对私有客户端 API 做逆向）。见[该论坛帖的员工回复](https://forum.cursor.com/t/does-using-oh-my-pi-s-cursor-provider-or-an-openai-compatible-proxy-to-the-same-endpoints-violate-cursor-s-tos/167778/5)。可能的处置包括限制账号或永久封禁。个人使用、只在本机跑、已付费订阅、「我没有对外卖号」，都不改变这一点。

目前官方支持的面是 Cursor IDE、Cursor CLI、[`@cursor/sdk`](https://cursor.com/docs/sdk) 和 Cloud Agents。那些跑的是 **Cursor 自己的 agent harness**，不是 DeepSeek Harness 能当模型路由驱动的原始推理面。社区要求官方 OpenAI 兼容 chat completions 的[功能请求](https://forum.cursor.com/t/openai-compatible-v1-chat-completions-for-cloud-api/164522)仍开放，没有公布时间表。

以上不是法律意见。安装和使用风险自负。另见 [Acceptable Use Policy](https://cursor.com/acceptable-use-policy)。

## 限制

- 必须能对 `api2.cursor.sh` 走 HTTP/2（含 ALPN）；没有代理桥。
- CLI 版本钉死值会在 Cursor 发新 CLI 后失效；变更时记 changelog。
- 额度百分比来自非官方 dashboard 轨道，不是官方 usage API。
- `Run` 的 token usage 没有 cache 字段，DSH 的 cache hit rate 会空着。
- Fast SKU 是独立模型族（`gpt-5.2` 与 `gpt-5.2-fast`），不是对话选择器里的第三项。
- 你也可以自己加通用上下文行（`claude-opus-5-272k`）。插件在发给 Cursor 前剥掉末尾的 `-<n>k` / `-<n>m`；DSH 用 `n×1000` / `n×1,000,000` 作为压缩预算。Cursor API 只有二元 `maxMode`，所以 272K 行仍发 `maxMode: false`——后缀只改 DSH 的压缩触发点。`kimi-k3-max` 这类产品名不算档位。Composer picker 按剥后缀后的 base 把兄弟行收成一个家族。

## 配置

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

bundle 默认对符合条件的模型请求失败最多重试八次。Connect/gRPC deadline 使用 `TIMEOUT`，HTTP 429 使用 `RATE_LIMIT`，HTTP/2 故障和流提前结束使用 `TRANSPORT`，unavailable、resource-exhausted 和 HTTP 5xx 使用 `SERVER`。鉴权、取消、invalid-argument 和其他 HTTP 4xx 仍不可重试。

每个 adapter 实例分别持有自己的 active Run、parked Run 与 conversation binding。parked Run 默认 15 分钟后过期；idle binding 保留一小时，让稍后的工具结果能用完整历史新开 resume Run。容量恢复先驱逐最早 parked Run，再删除最早 idle binding，绝不驱逐 active 工作。如果 64 个 Run 槽位全是 active，请求会在开 socket 前以 `LOCAL_CAPACITY` 本地失败。每次 heartbeat 都重新抽取 jitter；恢复后写入 `mcpResult`，提供方继续静默时仍受 `streamIdleTimeoutMs` 约束。详见 [ADR 0002](docs/adr/0002-adapter-owned-run-lifecycle.zh.md)。

没有 `apiKeyEnv`，也没有用户可改的聊天基址或 CLI 版本。在插件卡上保存后，所选目录写入 `models`。

Models 页如果出现 Cursor，也只是 hint。因为本包不声明 `apiKeyEnv`，那一行不应出现「缺 API key」红点。

## 供应商认证流程

设置读取经过白名单解码、保存带 revision 栅栏，且不返回 secret。

Cursor 使用外部认证：Host 立即返回 UUID/PKCE 授权 URL，由浏览器打开，Host 在后台轮询。begin、status、cancel、logout 都按 attempt 隔离。重启 DSH 会取消内存中的尝试；重启后重新开始供应商流程。

Host 的 `/cursor` RPC 遵循 Connection 的认证可信主机策略，包括 Host/Origin 检查和浏览器认证。本插件没有单独的 loopback 或远程管理开关。远程使用时配置 Connection 的可信主机；也可以使用 SSH 隧道，例如 `ssh -L 3080:127.0.0.1:3080 user@host`，然后打开 `http://127.0.0.1:3080`。

## LLM Providers UI 归属

**LLM 供应商**设置页（`settings.section` `id: providers` 及子槽 `settings.provider.item`）与共享的 `llm-providers` 排序存储完全由 `dsh-llm-providers-ui` 拥有。

- 本插件仅贡献自己的卡片（`key: llm-cursor`）和 Host 上的 `llm` 路由；不安装页面或共享命名空间。加载顺序不影响归属。
- 未安装 owner 时（Headless 或 Web 未装 `dsh-llm-providers-ui`）：Host 侧模型路由 `cursor` 仍可工作；Web 侧 Providers 页面与本卡片不显示，并在浏览器控制台提示缺少 owner。打包门禁会验证本插件的浏览器工厂不会请求或捆绑 owner；Web 组合仍由 profile 负责。
- 导航地球图标为 ``alpha.1`` 临时 DOM 适配器，仅由 `dsh-llm-providers-ui` 持有；本插件不含该适配。

请在 profile 中与 provider 插件一起显式安装 `dsh-llm-providers-ui`（见其 `cordis.patch.yml`）。

## 许可

MIT。vendored 的 AgentService protobuf 绑定来自 [oh-my-pi](https://github.com/can1357/oh-my-pi)（MIT），见 `NOTICE`。


## 正式版安装（Latest）

Unofficial Cursor subscription login, model discovery, and chat. 正式成品只支持 DeepSeek Harness 0.1.2-alpha.4；与 Alpha.1–Alpha.3 不兼容。仍使用旧 Harness 的用户请继续使用最后一个 Alpha.1 兼容版本。发布包只包含构建后的 Host/Client 产物，不包含兄弟仓库源码、本机路径或 link:/workspace: 依赖。

LLM Providers 页面、导航和共享排序由 dsh-llm-providers-ui 独占；本插件只提供卡片、模型和 Host 路由。Web 必须先装 Owner，headless 只使用 Host 路由时可以不装 Owner。

Owner（Latest）：

~~~sh
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/latest/download/dsh-llm-providers-ui-0.1.3.tgz
~~~

本 Provider（Latest）：

~~~sh
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-cursor/releases/latest/download/dsh-llm-cursor-0.2.15.tgz
~~~

固定版本（可复现）：

~~~sh
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-providers-ui/releases/download/v0.1.3/dsh-llm-providers-ui-0.1.3.tgz
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-cursor/releases/download/v0.2.15/dsh-llm-cursor-0.2.15.tgz
~~~

更新、卸载与验证：

~~~sh
# 更新到最新 Release
dsh plugin --profile web add --force \
  https://github.com/NOirBRight/dsh-llm-cursor/releases/latest/download/dsh-llm-cursor-0.2.15.tgz
# 验证加载与版本
dsh plugin --profile web list
dsh plugin --profile web doctor
# 只卸载本插件
dsh plugin --profile web remove dsh-llm-cursor
~~~

配置入口：Web 使用「设置」中的本插件页面；Host-only 插件使用 profile 的 dsh.profile.bundles 配置。先复制本 README 的最小 YAML/JSON 示例，再填写凭据或后端地址。

回滚：重新执行固定版本 v0.2.14 命令，确认插件列表后只重启一次 Web 服务。失败时查看 journalctl --user -u dsh-web.service 与 dsh plugin --profile web doctor，不要把源码 checkout 写入 production profile。

Release 与完整性：[v0.2.15](https://github.com/NOirBRight/dsh-llm-cursor/releases/tag/v0.2.15) · [SHA256SUMS](https://github.com/NOirBRight/dsh-llm-cursor/releases/download/v0.2.15/SHA256SUMS)。
