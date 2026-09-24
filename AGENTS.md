<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

## Deployment Constraints (本项目硬约束，AI 必须遵守)

本项目部署走 **Netlify**，**不要**引入任何其它部署服务 / 集成：

- **保留**：Netlify（`apps/forum/netlify.toml`、`apps/portal/netlify.toml`、`netlify.toml`、Netlify Functions）
- **禁止引入**：CloudStudio、EdgeOne Pages / Makers、Lighthouse 轻量应用服务器、CloudBase 静态托管（`manageHosting`）、`manageApps` 等任何腾讯生态部署集成
- **禁止调用**：`invoke_integration(id="cloudStudio"|"eop"|"lighthouse")`、`manageApps`、`manageHosting`（除非要查已部署内容；这时用 `cloud_studio_list_deployments` / `queryHosting` 等只读入口，写操作必须先得到人工授权）
- **禁止**：把任何 service_role / API Key 写进带 `VITE_` 前缀的环境变量——它们会进入 Netlify 浏览器产物，导致密钥泄露；任何需要绕过 RLS 的写操作请走后端 API Key（Netlify Functions），不要在浏览器侧滥用

迁移 / 数据库 schema 变更：仍然走 CloudBase（`packages/cloudbase/cloudbase/migrations/` + `vp run pg:push`），不要换数据库供应商。
