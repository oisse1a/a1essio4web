import { Button } from "@repo/shadcn/components/ui/button";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { m } from "~/app/paraglide/messages.js";

export function UnauthorisedError() {
  const navigate = useNavigate();
  const { history } = useRouter();
  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">401</h1>
        <span className="font-medium">{m.bright_access_denied()}</span>
        <p className="text-center text-muted-foreground">{m.quiet_contact_admin()}</p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => history.go(-1)}>
            {m.tired_maroon_javelina_delight()}
          </Button>
          <Button onClick={() => navigate({ to: "/" })}>{m.red_go_home()}</Button>
        </div>
      </div>
    </div>
  );
}
