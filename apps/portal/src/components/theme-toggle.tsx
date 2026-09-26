import { useEffect, useState } from "react";
import { Button } from "@repo/shadcn/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@repo/shadcn/components/ui/dropdown-menu";
import { Moon, Sun } from "lucide-react";
import { m } from "~/app/paraglide/messages";

type ThemeMode = "light" | "dark" | "auto";

function getInitialMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "auto";
  }

  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "auto") {
    return stored;
  }

  return "auto";
}

function resolveThemeMode(mode: ThemeMode): "light" | "dark" {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return mode === "auto" ? (prefersDark ? "dark" : "light") : mode;
}

function applyThemeMode(mode: ThemeMode) {
  const resolved = resolveThemeMode(mode);

  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(resolved);

  if (mode === "auto") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", mode);
  }

  document.documentElement.style.colorScheme = resolved;

  return resolved;
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("auto");
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const initialMode = getInitialMode();
    setMode(initialMode);
    setResolvedMode(applyThemeMode(initialMode));
  }, []);

  useEffect(() => {
    if (mode !== "auto") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedMode(applyThemeMode("auto"));

    media.addEventListener("change", onChange);
    return () => {
      media.removeEventListener("change", onChange);
    };
  }, [mode]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" aria-label="选择主题" />}>
        {resolvedMode === "light" ? <Sun /> : <Moon />}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-[25px]" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{m.seemly_north_kitten_quell()}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuRadioGroup
          value={mode}
          onValueChange={(value) => {
            if (value === "light" || value === "dark" || value === "auto") {
              setMode(value);
              setResolvedMode(applyThemeMode(value));
              window.localStorage.setItem("theme", value);
            }
          }}
        >
          <DropdownMenuRadioItem value="light">
            {m.strong_nimble_racoon_heart()}
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">{m.livid_main_husky_breathe()}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="auto">
            {m.inner_direct_crossbill_rush()}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
