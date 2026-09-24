import { Button } from "@repo/shadcn/components/ui/button";
import { cn } from "@repo/shadcn/lib/utils";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { m } from "~/app/paraglide/messages.js";

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean;
};

export function GeneralError({ className, minimal = false }: GeneralErrorProps) {
  const navigate = useNavigate();
  const { history } = useRouter();
  return (
    <div className={cn("h-svh w-full", className)}>
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        {!minimal && <h1 className="text-[7rem] leading-tight font-bold">500</h1>}
        <span className="font-medium">
          {m.warm_error_title()} {`:')`}
        </span>
        <p className="text-center text-muted-foreground">{m.calm_server_error()}</p>
        {!minimal && (
          <div className="mt-6 flex gap-4">
            <Button variant="outline" onClick={() => history.go(-1)}>
              {m.tired_maroon_javelina_delight()}
            </Button>
            <Button onClick={() => navigate({ to: "/" })}>{m.red_go_home()}</Button>
          </div>
        )}
      </div>
    </div>
  );
}
