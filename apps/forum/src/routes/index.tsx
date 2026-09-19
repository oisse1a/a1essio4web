import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: ForumHome });

function ForumHome() {
  return (
    <main className="page-wrap mx-auto max-w-4xl px-4 pb-16 pt-14">
      <p className="text-sm font-medium tracking-[0.2em] uppercase text-muted-foreground">
        CloudBase Forum
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">论坛即将上线</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        PostgreSQL、用户认证、对象存储和行级安全策略已经准备就绪。
      </p>
    </main>
  );
}
