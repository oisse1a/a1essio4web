import {} from "@repo/shadcn/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { m } from "~/app/paraglide/messages.js";

export const Route = createFileRoute("/")({ component: ForumHome });

function ForumHome() {
  return (
    <main className="page-wrap mx-auto max-w-4xl px-4 pb-16 pt-14">{m.bright_blue_fox()}</main>
  );
}
