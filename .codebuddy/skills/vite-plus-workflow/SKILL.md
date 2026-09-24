---
name: vite-plus-workflow
description: Vite+ 工具链（vp 命令）在 a1essio4web monorepo 中的标准用法：vp dev/build/check/test、vp run <name>、vp run -r <name> 跨包执行、shores#dev 任务、tcb:* 与 db:typegen 等数据库脚本。命中场景：在 apps/forum、apps/portal、packages/cloudbase、packages/shadcn 中开发、验证、提交代码。
---

# vite-plus-workflow

本仓库由 `pnpm workspace + Vite+` 管理。**所有命令必须走 `vp`**（`vp dev` / `vp build` / `vp check` / `vp test`），不要直接调 `vite` / `vitest` / `oxlint`。`vp <name>` 跑内置命令，`vp run <name>` 跑 `package.json` scripts 或 `vite.config.ts` 里定义的 task。

## 1. 顶层脚本

```sh
pnpm install                    # 等价 vp install；pull 之后、起步前都要跑
pnpm dev                        # = vp run shores#dev；同时启动 forum / portal
pnpm ready                      # = vp check && vp run -r test && vp run -r build（提 PR 前）
pnpm db:typegen                 # = pnpm --filter @repo/cloudbase db:typegen
```

## 2. 内置命令速查

| 命令              | 作用                                                          |
| ----------------- | ------------------------------------------------------------- |
| `vp dev`          | 启动 Vite dev server（具体应用走 `vite.config.ts` 里的 task） |
| `vp build`        | 生产构建（Rolldown）                                          |
| `vp preview`      | 跑构建产物                                                    |
| `vp check`        | format + lint + typecheck（统一入口）                         |
| `vp check --fix`  | 自动 format + autofix                                         |
| `vp test`         | 跑 Vitest                                                     |
| `vp run -r test`  | 在所有 workspace 包里跑 `test` script                         |
| `vp run -r build` | 在所有 workspace 包里跑 `build` script                        |
| `vp toolchain`    | 列出 Vite+ 当前 release 的工具版本                            |
| `vp env doctor`   | 排错 setup / runtime / 包管理行为                             |
| `vp why <pkg>`    | 展示某个包的依赖图                                            |

## 3. 跨包 / 单包选择

```sh
# 跨所有包跑 test
vp run -r test

# 只在 forum 包跑 build
vp run --filter forum build

# 跑 vite.config.ts 里定义的 task，例如同时启 forum + portal
vp run shores#dev
```

`shores#dev` 是根 `vite.config.ts` 暴露的任务：`pnpm dev` 直接调它，省去手动启两个端口。

## 4. CloudBase 相关（在 packages/cloudbase 下）

```sh
vp run tcb:help          # tcb --help
vp run tcb:login         # tcb login（账号级；MCP 集成会替你做这一步）
vp run tcb:gentype       # = pnpm db:typegen:admin
vp run pg:pull:dry       # 仅查看远端迁移差异，不写
vp run pg:pull           # 拉远端迁移
vp run pg:push:dry       # 预览本地迁移到远端的 DDL
vp run pg:push           # 执行本地迁移
```

提交论坛表结构变更的标准动作：

1. 新增 / 修改 `packages/cloudbase/cloudbase/migrations/*.sql`
2. `vp run pg:push:dry` 看 DDL
3. `vp run pg:push` 落地
4. `pnpm db:typegen` 重新生成 `src/database.types.ts`

## 5. 端口与路由

| 应用   | dev 端口 | netlify port           |
| ------ | -------- | ---------------------- |
| forum  | 3000     | 8888 (targetPort 3000) |
| portal | 3001     | 8888 (targetPort 3000) |

`netlify.toml` 里 `[dev] targetPort = 3000` 是占位，具体应用启动时会被各自的 dev script 覆盖——`apps/forum` 用 `vp dev --port 3000`，`apps/portal` 用 `vp dev --port 3001`。

## 6. 提 PR / 合并前的本地验证

```sh
pnpm install          # 任何 pull 之后
pnpm ready            # = vp check && vp run -r test && vp run -r build
```

其中：

- `vp check` 会跑 oxfmt + oxlint（type-aware）+ tsc，任何 format / lint / type 错误都会拦下来
- `vp run -r test` 在所有 workspace 包跑 Vitest
- `vp run -r build` 在所有包跑构建，确保跨包类型和导出都能跑通

`vite.config.ts` 已经把以下文件排除 lint/format（**不要**手动改它们，typegen / 路由代码生成器拥有最终话语权）：

- `packages/shadcn/src/lib/**/*`、`packages/shadcn/src/hooks/**/*`、`packages/shadcn/src/components/**/*`
- `**/routeTree.gen.ts`
- `**/database.types.ts`

## 7. 排错顺序

1. `vp env doctor` 看 setup / runtime / 包管理是否正常
2. `vp toolchain` 确认本地工具链与项目要求一致
3. 检查 `package.json` / `vite.config.ts` 里是否有同名 task；如有，用 `vp run <name>` 而不是 `vp <name>`
4. 真要反馈 bug，把 `vp env doctor` 输出贴给协作者

## 8. 不要做的事

- 不要绕过 `vp` 直接调 `vite` / `vitest` / `oxlint`（会绕过 Vite+ 的统一封装，工具链不一致）
- 不要把 `database.types.ts` / `routeTree.gen.ts` 加进 lint
- 不要在没有 `vp run pg:push:dry` 预览的情况下直接 `pg:push`
- 不要改 `packages/cloudbase/cloudbaserc.json` 里的 `envId`，那是账号 / 环境绑定
