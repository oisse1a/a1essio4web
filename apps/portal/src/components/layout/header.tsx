import { Link } from "@tanstack/react-router";

import ThemeToggle from "../theme-toggle";
import LangToggle from "../lang-toggle";
import { m } from "~/app/paraglide/messages";

export default function Header() {
  return (
    <header className="w-full max-w-270 mx-auto sticky top-0 z-50 border-b border-(--line)  px-4 ">
      <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <Link to="/">{m.calm_green_otter()}</Link>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-0 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link to="/" className="">
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
