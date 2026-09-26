import { m } from "~/app/paraglide/messages";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full max-w-270 mx-auto flex justify-center border-t border-(--line) px-4 pb-14 pt-10 text-(--sea-ink-soft)">
      <div className="page-wrap text-sm flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0">
          &copy; {year} {m.calm_green_otter()}. All rights reserved.
        </p>
        <p className="island-kicker m-0">Built with TanStack Start & CloudBase</p>
      </div>
    </footer>
  );
}
