# dsh-llm-cursor

[English](README.md) | 中文

DeepSeek Harness 的 Cursor 订阅登录与聊天插件。独立提供方路由 `cursor`、设置命名空间 `llm-cursor`。**不是**官方 Cursor CLI，也不调用官方 Cloud Agents 或 `@cursor/sdk`。

包根导出 Cordis 插件契约。同一产物的 `./client` 在 Settings → Plugins → Plugin configuration 下贡献 Cursor 卡。

## 安装

需要 DeepSeek Harness 0.1.0-rc.6 或更新。从 GitHub 安装：

~~~sh
dsh plugin --profile web add github:NOirBRight/dsh-llm-cursor
dsh web
~~~

仓库跟踪已构建的 lib 产物，GitHub 安装不需要允许构建脚本。源码检出可在 `pnpm run build` 后用 link 安装。

## Web 配置

打开 Settings → Plugins → Plugin configuration → Cursor。**用 Cursor 登录**会在 Host 上走 Deep Control PKCE（与官方 CLI 同一会话入口），打开系统浏览器并轮询到完成。会话只存在 Host 的 `$DSH_HOME/cursor-oauth.json`（权限 `0600`）。能读到邮箱则显示。登出删除该文件。浏览器永远收不到 token。

本插件**不**读、不写 `~/.cursor` 或官方 CLI 凭据。卡上没有粘贴码，也没有 Dashboard `crsr_…` API key 登录。

冻结 catalog 只读展示。登录后用 `GetUsableModels` 刷新对话选择器。聊天走 HTTP/2 Connect+protobuf `POST https://api2.cursor.sh/agent.v1.AgentService/Run`。DSH 仍是唯一的 agent loop 与工具执行方。登录后卡上还会展示额度（Host 读 `/auth/usage`，有 user id 时再读 `cursor.com/api/usage-summary`）。未登录不打额度网；对端没有可用窗口是 unsupported，不是错误。

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

## 配置

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

没有 `apiKeyEnv`，也没有用户可改的聊天基址或 CLI 版本。发现成功后可能把目录写进 `models`。

Models 页如果出现 Cursor，也只是 hint。因为本包不声明 `apiKeyEnv`，那一行不应出现「缺 API key」红点。

## 许可

MIT。vendored 的 AgentService protobuf 绑定来自 [oh-my-pi](https://github.com/can1357/oh-my-pi)（MIT），见 `NOTICE`。
