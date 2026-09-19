---
name: cloudbase-rdb-typed
description: 在 apps/forum、apps/portal 中使用 @repo/cloudbase 的 TypedRdb：createCloudbaseClient() 工厂、rdb().from("<forum_xxx>") 链式查询、与 RLS/auth.uid() 兼容的写法、database.types.ts 重新生成时机。
---

# cloudbase-rdb-typed

`@repo/cloudbase` 是 `@cloudbase/js-sdk` 的**纯类型**收窄层：运行时就是 SDK 原生 `rdb()`，只有 `rdb()` 的入参 / 返回类型被生成的 `Database` 锁住。这意味着 SDK 的所有原生方法（`auth()`、`storage()`、`database()`）都直接可用，**只有 `rdb()` 是类型安全的**。

## 1. 创建客户端

只在应用层做一次，传入浏览器变量：

```ts
// apps/forum/src/cloudbase.ts
import { createCloudbaseClient } from "@repo/cloudbase";

export const cloudbase = createCloudbaseClient({
  env: import.meta.env.VITE_CLOUDBASE_ENV_ID,
  region: import.meta.env.VITE_CLOUDBASE_REGION,
  accessKey: import.meta.env.VITE_CLOUDBASE_ACCESS_KEY, // publishable key，会进产物
});
```

环境变量在 `apps/<app>/.env.local`：

```dotenv
VITE_CLOUDBASE_ENV_ID=a1essio-dev-d5ghpegxqb4dbd526
VITE_CLOUDBASE_REGION=ap-singapore
VITE_CLOUDBASE_ACCESS_KEY=<publishable key>
```

**绝对不要**把 service_role / API Key 写进 VITE_ 前缀——它会进入浏览器产物。任何需要绕过 RLS 的写入请走后端。

## 2. rdb() 用法

```ts
const rdb = cloudbase.rdb();

// 列表（published 帖，按时间倒序）
const { data: posts, error } = await rdb
  .from("forum_posts")
  .select("*")
  .eq("status", "published")
  .order("created_at", { ascending: false })
  .limit(20);

// 单条
const { data: post, error } = await rdb.from("forum_posts").select("*").eq("id", postId).single();

// 插入（author_id 由 default auth.uid() 自动填，遵守 RLS）
const { data, error } = await rdb.from("forum_posts").insert({ category_id, title, content });

// 更新（只能改自己的，RLS 拦截）
const { data, error } = await rdb
  .from("forum_posts")
  .update({ title, content, updated_at: new Date().toISOString() })
  .eq("id", postId)
  .eq("author_id", currentUserId);

// 删除（自己或管理员）
const { error } = await rdb.from("forum_replies").delete().eq("id", replyId);
```

## 3. 关键约束

- 表名强类型来自 `Database["public"]["Tables"]`，**必须是 `forum_xxx` 前缀**的表；非论坛表会编译失败
- 列名强类型来自 `Row<Table>` / `Insert<Table>` / `Update<Table>`，拼错或类型不匹配会编译失败
- `select("*")` 是字面量 `"*"`；自定义列暂未实现，请用 `"*"`
- `single()` 返回 `RdbSingleResult<RowType>`，列表返回 `RdbResult<RowType>`
- 错误处理：用解构出的 `error` 判空，不要假设 `data` 一定有值

## 4. 与 RLS 的边界

- `rdb()` 在浏览器调用走的是 **anon / authenticated** 角色，受 RLS 约束
- 任何 `insert` 的 `author_id` / `reporter_id` / `uploader_id` 都会被 RLS 强制等于 `auth.uid()`，**不要**在客户端伪造别人的 ID
- 管理员操作（删帖、删板块、改举报状态）由 JWT 的 `app_metadata.forum_role` 决定；浏览器侧拿不到这个字段的"魔法值"，必须确认用户真的登录后才有
- 后端批处理 / 数据修复请用 API Key 调用 `managePgDatabase`，不要用浏览器 rdb()

## 5. 重新生成 database.types.ts

只要迁移落地（`vp run pg:push`），就重新跑：

```sh
pnpm db:typegen        # 默认 cloudbase_read_only_user
pnpm db:typegen:admin  # 需要更高权限时
```

它会调用 `tcb db execute` 查 `information_schema.columns` + `pg_catalog`，再写 `packages/cloudbase/src/database.types.ts`。生成完**直接生效**（本包没有 build 步骤）。

生成后：

- 提交 `database.types.ts`（它被 `vite.config.ts` 排除 lint/format，但仍跟代码一起进版本库）
- 检查新表的 Row / Insert / Update 三种形状是否合理
- 如果发现 schema 与代码不一致，**先检查迁移**，不要改 types 文件

## 6. 不要做的事

- 不要在浏览器调用 `app.uploadFile()`（legacy NoSQL 路径），本环境的 NoSQL 没开通
- 不要用 `cloudbase.database()`（同样依赖未开通的 NoSQL）
- 不要新增非 `forum_` 前缀的表——会让 TS 编译失败，且破坏多项目共享环境的隔离
- 不要把 `database.types.ts` 写进 lint / format pipeline（已在 `vite.config.ts` 排除）

## 7. 常见错误排查

| 现象                                   | 原因                                                          |
| -------------------------------------- | ------------------------------------------------------------- |
| `Type ... is not assignable to ...`    | 迁移没跑 / 没重新跑 `db:typegen`                              |
| `insert` 触发 RLS 拒绝                 | `author_id` 没等于 `auth.uid()`（检查当前是否匿名）           |
| `select` 返回空数组                    | RLS 把 published 之外的行过滤掉了，符合预期                   |
| `Cannot find module '@repo/cloudbase'` | `packages/cloudbase` 没在 workspace 链接，重跑 `pnpm install` |
