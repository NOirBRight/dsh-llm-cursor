# DSH 两套平面

3080 / `~/.dsh` 是工作空间：只安装 Release 的 GitHub 插件（`github:…#vX.Y.Z`）；只读，不为预览改/刷新/重启。
3082 / `~/.dsh-lab` 是测试空间：只安装 `link:` 到 Workstation checkout 的插件；验收、预览、重启只走这里。
完整约定：`/home/noirbright/Workstation/AGENTS.md`

## Core 边界

本项目只维护插件：官方 DeepSeek Harness 及其本地 checkout 是只读依赖。实现与兼容处理留在本项目；禁止修改或要求 DSH core patch。缺少公开 seam 时记录上游提案，并让插件在干净的官方 tag 上降级或关闭该能力。

## DSH 版本兼容

- 官方 DSH Host 包（`@deepseek-ai/dsh` 及其工作区 `@deepseek-ai/dsh-*` 包）在 `package.json` 的 `dependencies`、`optionalDependencies`、`devDependencies`、`peerDependencies` 中使用无上界的下限范围 `>=<最早已验证兼容版本>`；锁文件可固定实际验证的版本。独立发布的插件依赖按其发布渠道声明。
- 声明兼容新 DSH release 前，审查其公开 API 变化与插件实际调用，运行相关测试和 `pnpm run build`，并在 3082（`DSH_HOME=~/.dsh-lab`）验证；全部通过后再宣称兼容。
