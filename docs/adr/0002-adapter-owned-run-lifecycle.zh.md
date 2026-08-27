# ADR 0002：由 Adapter 持有 Cursor Run 生命周期

[English](0002-adapter-owned-run-lifecycle.md) | 中文

## 状态

已接受 — 2026-08-27

## 上下文

未完成的 Cursor `Run` 会跨过 DSH 工具边界保持打开，让下一轮在同一条流上写入 `mcpResult`。模块全局的 parked Run 和 conversation binding 会让多个 adapter 实例共享所有权，abort 可能关闭错误请求，而且没有时间或容量上限。恢复后的流还会把提供方静默当成本地工作，写完工具结果后可能永久等待。

## 决策

每个 `CursorAdapter` 持有一个 `CursorRunRegistry`。registry 跟踪所有 active / parked Run，按 DSH session 建索引，并持有 conversation binding、heartbeat、park 过期、binding 过期和容量限制。领取 parked Run 时，先同步把它改为 active，再写 `mcpResult`。

请求 abort 只关闭该请求领取或新开的 Run。`turn/end` 关闭该 DSH session 的所有 Run，但保留 binding；`session/disposed` 还会删除 binding。Cordis effect disposer 关闭所有剩余 Run，并清除所有 timer 和 binding。park 过期只关闭传输并保留 binding，因此稍后的工具结果会用完整 DSH 历史新开 Run，并使用 Cursor resume action。

heartbeat 通过递归 timeout 调度，每次写入都重新抽取对称 jitter。流已关闭或 heartbeat 写入失败时释放 Run。恢复后写入 `mcpResult`，提供方继续静默时，与其它提供方等待一样受 `streamIdleTimeoutMs` 约束。

容量恢复先关闭最早 parked Run，再删除最早 idle binding。active Run 及其 binding 永不驱逐。如果所有 Run 槽位都处于 active，新请求会在创建 HTTP/2 流之前以默认不重试的 `LOCAL_CAPACITY` 失败。

## 后果

- adapter 实例互相隔离，每条传输只有一个生命周期所有者。
- parked 传输和 idle conversation 状态同时受时间与数量限制。
- settings 变化会重排现有 timer，并在不驱逐 active 工作的前提下收紧容量。
- 生命周期诊断只包含稳定 reason 与聚合计数，不包含 prompt、工具结果或 token 内容。

## 否决的替代

- **保留模块全局 map，只增加 cleanup 调用。** 所有权仍跨越 adapter 和插件生命周期，精确取消与销毁仍不可靠。
- **到 DSH 工具边界就关闭所有 Run。** 这会丢掉提供方偏好的同流 `mcpResult` 路径，并让完整历史回放变成常态。
- **把 Cursor 传输状态放进 DSH core。** 状态和协议都属于提供方；session event 已能提供插件需要的生命周期信号。
