---
name: cloudbase-migration
description: 创建或评审 CloudBase PG 数据库迁移文件（SQL 命名、forum_* 前缀、uuid 主键、RLS + GRANT 双层、app_metadata 业务角色判定）。覆盖 packages/cloudbase/cloudbase/migrations/ 下的所有 *.sql。命中场景：新增表、改表、加策略、生成迁移草稿。
---

# cloudbase-migration

本仓库的 PostgreSQL 后端在 `a1essio-dev-d5ghpegxqb4dbd526`（ap-singapore）。所有数据表都走 CloudBase PG + `gen_random_uuid()` + RLS + GRANT，**不**使用外键，**不**使用 NoSQL/MySQL。

## 1. 文件命名与位置

- 路径：`packages/cloudbase/cloudbase/migrations/`
- 命名：`YYYYMMDDHHMMSS_<snake_case>.sql`，时间戳与文件名一一对应（typegen 元数据查询依赖它）
- 一次迁移只做一类变更（建表 / 改表 / 索引 / 策略）
- 执行前先 `vp run pg:pull:dry` 拉远端比对；执行后跑 `pnpm db:typegen` 重新生成 `src/database.types.ts`

## 2. 命名约定

- 同一个环境承载多个项目，**所有业务表 / 索引 / 策略统一 `forum_` 前缀**（`forum_categories`、`forum_posts`…），防止表名冲突
- 现有前缀清单：`forum_categories`、`forum_posts`、`forum_replies`、`forum_post_likes`、`forum_reply_likes`、`forum_attachments`、`forum_reports`
- 策略名与表名保持一致：`forum_posts_public_read`、`forum_posts_author_update`…

## 3. 主键与必填列

- 主键：`id uuid primary key default gen_random_uuid()`
- 业务列使用 `auth.uid()` 当默认：`author_id varchar(64) not null default auth.uid()`
- 文本字段必加 `check (char_length(trim(<col>)) between <min> and <max>)`
- 状态字段用 `text` + `check (... in ('a','b','c'))`（不用 enum，避免改枚举代价）
- 时间戳：`created_at timestamptz not null default now()` / `updated_at timestamptz not null default now()`
- **禁止外键**（包括级联），表间关联 ID 由应用层维护

## 4. 用户身份与业务角色

- 不再自建 profiles 用户表，统一用 `auth.users`（CloudBase 认证系统）
- 数据库角色 `anon / authenticated / service_role` **只供 GRANT + RLS 校验**，**不要**用它做业务判断
- 业务角色判定一律走 JWT：
  ```sql
  (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin')
  ```
- 后端批处理 / 数据修复用 API Key（service_role），它能绕过 RLS

## 5. RLS 策略范式

每张业务表必须 `enable row level security`，并为每种操作配策略：

```sql
alter table public.forum_xxx enable row level security;

-- 公开读：游客读 published，自己的内容总是能读，管理员全读
create policy forum_xxx_public_read on public.forum_xxx for select to anon, authenticated
   using (
     status = 'published'
     or author_id = auth.uid()
     or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin')
   );

-- 写入：作者本人，author_id 必须等于自己
create policy forum_xxx_self_insert on public.forum_xxx for insert to authenticated
   with check (author_id = auth.uid());

-- 修改：作者或管理员
create policy forum_xxx_author_update on public.forum_xxx for update to authenticated
   using (
     author_id = auth.uid()
     or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin')
   )
   with check (
     author_id = auth.uid()
     or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin')
   );

-- 删除：作者或管理员
create policy forum_xxx_author_delete on public.forum_xxx for delete to authenticated
   using (
     author_id = auth.uid()
     or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin')
   );
```

举报 / 附件这类敏感或关联表使用对应的 `self_*` / `admin_*` 变体，参见 `20260919160000_create_forum_uuid_schema.sql`。

## 6. GRANT（与 RLS 缺一不可）

- 公开内容：`grant select on public.forum_a, public.forum_b to anon, authenticated;`
- 写入自己的内容：`grant insert, update, delete on public.forum_a, public.forum_b to authenticated;`
- 点赞 / 附件关联表：`grant insert, delete ... to authenticated;`
- 举报：`grant insert, select, update ... to authenticated;`

## 7. 索引

- 列表查询索引统一 `(category_id, created_at desc, id desc)` 或类似 `(主筛选, 时间 desc, id desc)`
- 只对公开内容建 **partial index**：`where status = 'published'`，避免隐藏 / 删除内容污染公开列表

## 8. 编辑检查清单

新增 / 修改迁移前确认：

- [ ] 文件名符合 `YYYYMMDDHHMMSS_*.sql`
- [ ] 表 / 索引 / 策略都以 `forum_` 前缀
- [ ] 主键 `uuid primary key default gen_random_uuid()`
- [ ] 所有文本字段有 `char_length(trim(...))` 约束
- [ ] `enable row level security` + 至少一条策略（公开读 + 自身写入）
- [ ] 对应的 `grant ... to anon, authenticated`
- [ ] 索引带 `where status = 'published'` 过滤
- [ ] 跑过 `vp run pg:pull:dry`（远端无冲突）
- [ ] 跑过 `pnpm db:typegen`（`database.types.ts` 已同步）

## 9. 提交与发布

1. `vp run pg:push:dry` 预览 DDL
2. `vp run pg:push` 执行迁移
3. `pnpm db:typegen` 重新生成 `src/database.types.ts`
4. 检查生成的表结构：`queryPgDatabase(action="metadata", schema="public")`
5. 不要把 `database.types.ts` 手改——它由脚本生成
