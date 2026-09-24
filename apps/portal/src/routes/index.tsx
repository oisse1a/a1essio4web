import { createFileRoute, Link } from "@tanstack/react-router";
import { m } from "~/app/paraglide/messages.js";
import { Button } from "@repo/shadcn/components/ui/button";
import { getLocale, setLocale } from "~/app/paraglide/runtime.js";
export const Route = createFileRoute("/")({ component: ForumHome });

function ForumHome() {
  return (
    <main className="page-wrap mx-auto max-w-4xl px-4 pb-16 pt-14">
      <h1>{m.example_message({ username: "名称" })}</h1>
      <Button onClick={() => setLocale("en")}>en {getLocale()}</Button>
      <Button onClick={() => setLocale("zh")}>zh {getLocale()}</Button>
      <Link to="/user">Go to /en</Link>
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
