import { Button } from "@repo/shadcn/components/ui/button";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { m } from "~/app/paraglide/messages.js";

export function NotFoundError() {
  const navigate = useNavigate();
  const { history } = useRouter();
  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">404</h1>
        <span className="font-medium">{m.blue_not_found_title()}</span>
        <p className="text-center text-muted-foreground">{m.orange_not_found_description()}</p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => history.go(-1)}>
            {m.gentle_blue_moon()}
          </Button>
          <Button onClick={() => navigate({ to: "/" })}>{m.red_go_home()}</Button>
        </div>
      </div>
    </div>
  );
}
