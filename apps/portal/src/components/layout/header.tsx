import { Link } from "@tanstack/react-router";

import ThemeToggle from "../ThemeToggle";
import LangToggle from "../lang-toggle";
import { m } from "~/app/paraglide/messages";
import { Button } from "@repo/shadcn/components/ui/button";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--line)  px-4 ">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <Button variant="outline" className="m-0 shrink-0 text-base font-semibold tracking-tight">
          <Link to="/">{m.calm_green_otter()}</Link>
        </Button>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-0 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link to="/" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
            {m.quiet_silver_bird()}
          </Link>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <LangToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
