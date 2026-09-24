-- CloudBase PG 论坛数据库初始化。
--
-- 设计说明：
-- 1. 用户账号由 CloudBase 认证系统统一管理（auth schema 下的 auth.users），
--    因此本迁移不再自建 profiles 用户表，也不做账号同步。
-- 2. 登录态与鉴权全部使用 CloudBase 内置能力，不自定义任何函数：
--      auth.uid()  -> 当前登录用户 ID，等价于 JWT 的 sub
--      auth.jwt()  -> 完整 JWT claims，可读取 app_metadata 等自定义字段
--      anon / authenticated / service_role -> 内置数据库角色
-- 3. 本迁移不建立任何外键（含级联删除），表之间的关联 ID 由应用层维护，
--    避免表关系变复杂后带来写入性能开销与后续变更成本。
--
-- 业务角色判定：读取 CloudBase 用户自定义字段 app_metadata.forum_role，
-- 取值 'moderator' 或 'admin' 视为论坛管理员，可在云开发控制台用户管理中配置。
-- 注意：SDK User 对象和 JWT 里的 role（单数）是数据库角色
-- （anon / authenticated / service_role），只供 CloudBase 的 GRANT + RLS 校验使用，
-- 不要用来做业务权限判断；业务角色请一律放在 app_metadata 中。
-- 后端批处理 / 数据修复请使用 API Key（service_role），该角色可绕过 RLS。
--
-- 主键统一使用 uuid，默认值由 PostgreSQL 13+ 内置函数 gen_random_uuid() 生成，
-- 无需安装额外扩展。
--
-- 命名约定：同一个 CloudBase 环境后续可能承载多个项目，因此本论坛的全部表、
-- 索引和策略统一使用 forum_ 前缀，避免与其他项目的业务表重名冲突。
--   forum_categories    板块
--   forum_posts         主题帖
--   forum_replies       回复
--   forum_post_likes    帖子点赞
--   forum_reply_likes   回复点赞
--   forum_attachments   附件元数据
--   forum_reports       举报记录

-- 论坛板块。板块本身不含用户敏感数据。
create table public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(trim(name)) between 1 and 80),
  description text not null default '' check (char_length(description) <= 500),
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 论坛主题帖。
-- author_id 只保存 auth.users.id，不复制昵称、邮箱、头像等用户资料。
create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null,
  author_id varchar(64) not null default auth.uid(),
  title text not null check (char_length(trim(title)) between 1 and 160),
  content text not null check (char_length(trim(content)) between 1 and 30000),
  cover_url text,
  status text not null default 'published' check (status in ('published', 'hidden', 'deleted')),
  view_count bigint not null default 0 check (view_count >= 0),
  like_count bigint not null default 0 check (like_count >= 0),
  reply_count bigint not null default 0 check (reply_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 帖子回复。parent_id 用于支持回复回复，但不通过数据库外键强制关系。
create table public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  author_id varchar(64) not null default auth.uid(),
  parent_id uuid,
  content text not null check (char_length(trim(content)) between 1 and 10000),
  status text not null default 'published' check (status in ('published', 'hidden', 'deleted')),
  like_count bigint not null default 0 check (like_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 点赞关系表。
-- 联合主键保证同一用户不能重复点赞同一帖子。
create table public.forum_post_likes (
  post_id uuid not null,
  user_id varchar(64) not null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- 回复点赞关系表。
create table public.forum_reply_likes (
  reply_id uuid not null,
  user_id varchar(64) not null default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (reply_id, user_id)
);

-- 对象存储附件元数据。实际文件保存在 CloudBase Storage，数据库只保存对象定位信息。
-- 一个附件只能属于帖子或回复其中之一。
create table public.forum_attachments (
  id uuid primary key default gen_random_uuid(),
  uploader_id varchar(64) not null default auth.uid(),
  post_id uuid,
  reply_id uuid,
  bucket_name text not null,
  object_key text not null,
  mime_type text not null,
  file_size bigint not null check (file_size > 0),
  created_at timestamptz not null default now(),
  check ((post_id is not null) <> (reply_id is not null)),
  unique (bucket_name, object_key)
);

-- 用户举报记录。target_id 是帖子或回复的 UUID，target_type 用于区分目标表。
create table public.forum_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id varchar(64) not null default auth.uid(),
  target_type text not null check (target_type in ('post', 'reply')),
  target_id uuid not null,
  reason text not null check (char_length(trim(reason)) between 1 and 80),
  description text not null default '' check (char_length(description) <= 2000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'rejected')),
  handled_by varchar(64),
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

-- 常用列表查询索引。
-- partial index 只索引公开内容，减少隐藏/删除内容对公开列表的影响。
create index forum_posts_category_created_at_idx
  on public.forum_posts (category_id, created_at desc, id desc)
  where status = 'published';
create index forum_posts_author_created_at_idx
  on public.forum_posts (author_id, created_at desc);
create index forum_replies_post_created_at_idx
  on public.forum_replies (post_id, created_at asc, id asc)
  where status = 'published';
create index forum_attachments_post_idx on public.forum_attachments (post_id);
create index forum_attachments_reply_idx on public.forum_attachments (reply_id);
create index forum_reports_status_created_at_idx on public.forum_reports (status, created_at desc);

-- 开启 RLS 后，没有匹配策略的请求默认拒绝。
-- anon：发布密钥/游客，只能读取公开内容。
-- authenticated：登录用户，可以按策略创建和修改自己的内容。
-- service_role：仅后端使用，拥有 CloudBase 平台级绕过权限。
alter table public.forum_categories enable row level security;
create policy forum_categories_public_read on public.forum_categories for select to anon, authenticated
  using (not is_archived or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));
create policy forum_categories_admin_insert on public.forum_categories for insert to authenticated
  with check ((auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));
create policy forum_categories_admin_update on public.forum_categories for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));
create policy forum_categories_admin_delete on public.forum_categories for delete to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));

-- 主题帖：公开读取 published；作者只能修改/删除自己的帖子；管理员可以管理全部帖子。
alter table public.forum_posts enable row level security;
create policy forum_posts_public_read on public.forum_posts for select to anon, authenticated
  using (status = 'published' or author_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));
create policy forum_posts_authenticated_insert on public.forum_posts for insert to authenticated
  with check (author_id = auth.uid());
create policy forum_posts_author_update on public.forum_posts for update to authenticated
  using (author_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'))
  with check (author_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));
create policy forum_posts_author_delete on public.forum_posts for delete to authenticated
  using (author_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));

-- 回复：规则与主题帖一致，并允许 parent_id 形成回复层级。
alter table public.forum_replies enable row level security;
create policy forum_replies_public_read on public.forum_replies for select to anon, authenticated
  using (status = 'published' or author_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));
create policy forum_replies_authenticated_insert on public.forum_replies for insert to authenticated
  with check (author_id = auth.uid());
create policy forum_replies_author_update on public.forum_replies for update to authenticated
  using (author_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'))
  with check (author_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));
create policy forum_replies_author_delete on public.forum_replies for delete to authenticated
  using (author_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));

-- 点赞对所有人可读，但只有登录用户能写入/删除自己的点赞。
alter table public.forum_post_likes enable row level security;
create policy forum_post_likes_public_read on public.forum_post_likes for select to anon, authenticated using (true);
create policy forum_post_likes_self_insert on public.forum_post_likes for insert to authenticated
  with check (user_id = auth.uid());
create policy forum_post_likes_self_delete on public.forum_post_likes for delete to authenticated
  using (user_id = auth.uid());

-- 回复点赞与帖子点赞使用相同的权限模型。
alter table public.forum_reply_likes enable row level security;
create policy forum_reply_likes_public_read on public.forum_reply_likes for select to anon, authenticated using (true);
create policy forum_reply_likes_self_insert on public.forum_reply_likes for insert to authenticated
  with check (user_id = auth.uid());
create policy forum_reply_likes_self_delete on public.forum_reply_likes for delete to authenticated
  using (user_id = auth.uid());

-- 附件只有在所属帖子/回复公开时才允许游客读取；上传者和管理员可管理附件。
alter table public.forum_attachments enable row level security;
create policy forum_attachments_public_read on public.forum_attachments for select to anon, authenticated using (
  exists (select 1 from public.forum_posts where forum_posts.id = forum_attachments.post_id and forum_posts.status = 'published')
  or exists (select 1 from public.forum_replies where forum_replies.id = forum_attachments.reply_id and forum_replies.status = 'published')
  or uploader_id = auth.uid()
  or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin')
);
create policy forum_attachments_self_insert on public.forum_attachments for insert to authenticated
  with check (uploader_id = auth.uid());
create policy forum_attachments_self_delete on public.forum_attachments for delete to authenticated
  using (uploader_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));

-- 举报内容属于敏感数据：举报人只能查看自己的举报，管理员可以处理全部举报。
alter table public.forum_reports enable row level security;
create policy forum_reports_self_insert on public.forum_reports for insert to authenticated
  with check (reporter_id = auth.uid());
create policy forum_reports_self_read on public.forum_reports for select to authenticated
  using (reporter_id = auth.uid() or (auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));
create policy forum_reports_admin_update on public.forum_reports for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'forum_role') in ('moderator', 'admin'));

-- GRANT：CloudBase PG 是 GRANT + RLS 双层校验，两者缺一不可。
-- GRANT 决定角色能否访问表，RLS 决定角色能访问哪些行。
-- 公开内容对 anon / authenticated 开放读取。
grant select on public.forum_categories, public.forum_posts, public.forum_replies,
  public.forum_post_likes, public.forum_reply_likes, public.forum_attachments to anon, authenticated;
-- 登录用户写入自己的内容，最终以 RLS 策略为准。
grant insert, update, delete on public.forum_categories, public.forum_posts, public.forum_replies to authenticated;
grant insert, delete on public.forum_post_likes, public.forum_reply_likes, public.forum_attachments to authenticated;
grant insert, select, update on public.forum_reports to authenticated;
