import { Button } from "@repo/shadcn/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/")({ component: App });

function App() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <Button>Click me</Button>
      <Button>Button</Button>
      <Button size="xs" variant="outline">
        Extra Small
      </Button>
    </main>
  );
}
