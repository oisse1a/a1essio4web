# a1essio4web

由 pnpm workspace + Vite+ 管理的 monorepo：一个网站项目。

## 项目结构

```
apps/
  shores/          主站（TanStack Start + React 19 + Tailwind v4，部署到 Netlify）
packages/
  cloudbase/       CloudBase 类型化客户端（PostgreSQL / rdb）
  shadcn/          shadcn/ui 组件库
  tsconfig/        共享 TypeScript 配置
```

`apps/**` 产出可运行的应用；`packages/*` 以源码形式被直接引用。

## 技术栈

| 领域   | 选型                                                     |
| ------ | -------------------------------------------------------- |
| 工具链 | pnpm workspace + Vite+（`vp` 命令）                      |
| 框架   | TanStack Start / Router（文件路由 + SSR）                |
| UI     | React 19、Tailwind CSS v4、shadcn/ui                     |
| 数据   | 腾讯云 CloudBase（PostgreSQL，通过 SDK 原生 `rdb()`）    |
| 部署   | Netlify（`netlify.toml`，SSR 由 Netlify Functions 承载） |

## 开始

要求 Node >= 22.18.0、pnpm 11。

```bash
pnpm install
pnpm dev
```

### [app/shores](app/shores/)

### 环境变量

写入 `apps/shores/.env.local`：

```dotenv
VITE_CLOUDBASE_ENV_ID=<环境 ID>
VITE_CLOUDBASE_REGION=ap-singapore
VITE_CLOUDBASE_ACCESS_KEY=<可发布密钥>
```

`VITE_CLOUDBASE_ACCESS_KEY` 是 CloudBase 的可发布密钥（publishable key），会进入浏览器产物，因此不要在这里放私密凭据。
