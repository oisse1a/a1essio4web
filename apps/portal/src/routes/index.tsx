import { createFileRoute } from "@tanstack/react-router";
import { m } from "~/app/paraglide/messages.js";

export const Route = createFileRoute("/")({ component: ForumHome });

function ForumHome() {
  return (
    <main className="page-wrap mx-auto max-w-4xl px-4 pb-16 pt-14">
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">{m.last_sound_bear_wave()}</h1>
    </main>
  );
}
