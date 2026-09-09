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

`cloudbase.auth()`、`database()`、`storage()` 等方法直接使用 CloudBase SDK 的原生类型；`rdb()` 是同一个客户端上的类型增强方法。

Vite 应用可以使用内置环境变量实例：

```ts
import { cloudbase } from "@repo/cloudbase/vite";
```

主入口不读取 `import.meta.env`，因此可以在 Node、测试环境和其他 bundler 中安全导入。

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

生成后执行 `pnpm build` 会输出 `dist` 中的 ESM 和 `.d.ts` 文件，可直接发布或被其他项目安装使用。
