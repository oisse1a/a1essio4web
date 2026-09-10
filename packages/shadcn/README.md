# @repo/shadcn

源码分发的 shadcn/ui 组件库。组件、样式与工具都以源码形式被其他 workspace 包直接引用：本包没有构建产物，也没有 dev server。

```tsx
import { Button } from "@repo/shadcn/components/ui/button";
import shadcnCss from "@repo/shadcn/globals.css?url";
import sourceCss from "@repo/shadcn/source.css?url";
```

## 新增组件

`components.json` 供 shadcn CLI 使用，别名直接指向本包源码：

```sh
pnpm dlx shadcn@latest add <component>
```

新增后无需构建，改动即时生效。

## 校验

```sh
pnpm --filter @repo/shadcn typecheck
```

`globals.css` 依赖 `tailwindcss`、`tw-animate-css`、`shadcn/tailwind.css` 与 `@fontsource-variable/inter`，
这些包必须保留在 `dependencies` 中，否则消费端解析样式时会失败。
