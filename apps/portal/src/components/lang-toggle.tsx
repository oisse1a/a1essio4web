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
import { Languages } from "lucide-react";
import { m } from "~/app/paraglide/messages";
import { getLocale, isLocale, setLocale } from "~/app/paraglide/runtime";

export default function LangToggle() {
  const locale = getLocale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" aria-label="选择语言" />}>
        <Languages />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-[25px]" align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{m.early_funny_macaw_emerge()}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => {
            if (isLocale(value)) {
              void setLocale(value);
            }
          }}
        >
          <DropdownMenuRadioItem value="zh">简体中文</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
