# CloudBase Typed Client

一个轻量的 `@cloudbase/js-sdk` 类型增强层。SDK 原生能力保持原样，只有 `rdb()` 使用生成的数据库类型做表名、行、写入和过滤条件约束。

## 使用

```ts
import { createCloudbaseClient } from "@repo/cloudbase";

const cloudbase = createCloudbaseClient({
  env: "your-env-id",
  region: "ap-shanghai",
});

const todos = await cloudbase.rdb().from("todo").select("*").limit(100);
await cloudbase.auth().anonymousAuthProvider().signIn();
```

`cloudbase.auth()`、`database()`、`storage()` 等方法直接使用 CloudBase SDK 的原生类型。

`rdb()` 就是 SDK 原生的 PostgreSQL 客户端（请求 `/rdb/rest`）。本包只把它的返回类型收窄为生成的 `Database`，不覆盖任何运行时实现，因此不会误落到文档数据库。

环境变量由调用方提供，本包不读取 `import.meta.env`，可在 Node、测试环境和其他 bundler 中安全导入：

```ts
import { createCloudbaseClient } from "@repo/cloudbase";

export const cloudbase = createCloudbaseClient({
  env: import.meta.env.VITE_CLOUDBASE_ENV_ID,
  accessKey: import.meta.env.VITE_CLOUDBASE_ACCESS_KEY,
});
```

本包以 TypeScript 源码形式被其他 workspace 包直接导入（`exports` 指向 `src/index.ts`），没有构建步骤，修改后即时生效。

## TCB CLI

```sh
vp run tcb:help
vp run tcb:login
vp run pg:pull:dry
vp run pg:pull
vp run pg:push:dry
vp run pg:push
```

CLI 读取 `cloudbaserc.json`，不会把凭据写入仓库。

## 类型生成

类型生成器使用 CloudBase CLI 查询 PostgreSQL 元数据，并写入 `src/database.types.ts`：

```sh
pnpm db:typegen
pnpm db:typegen:admin
node --experimental-strip-types scripts/typegen.ts --role my_database_role
```

默认角色是 `cloudbase_read_only_user`，也可以通过 `CLOUDBASE_DB_ROLE` 指定已授权角色。`--admin` 和 `--role` 不能同时使用。

生成后类型随源码直接生效，无需构建或发布。
