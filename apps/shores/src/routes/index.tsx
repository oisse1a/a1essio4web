import { useEffect, useState } from "react";
import type { Row } from "@repo/cloudbase";
import { Button } from "@repo/shadcn/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

import { cloudbase } from "#/cloudbase";

export const Route = createFileRoute("/")({ component: App });

type Todo = Row<"todo">;
const todoTable = cloudbase.rdb().from("todo");

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadTodos() {
    setLoading(true);
    const result = await todoTable.select("*").limit(100);
    if (result.error) setMessage("加载 todo 失败");
    console.log("result", result);
    setTodos(result.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void (async () => {
      try {
        await cloudbase.auth().signInAnonymously({});
        await loadTodos();
      } catch {
        setLoading(false);
        setMessage("匿名登录失败，请检查 CloudBase 匿名登录配置");
      }
    })();
  }, []);

  async function createTodo(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (!nextTitle) return;

    const result = await todoTable.insert({ title: nextTitle });
    if (result.error) {
      setMessage("创建 todo 失败");
      return;
    }
    setTitle("");
    await loadTodos();
  }

  async function toggleTodo(todo: Todo) {
    if (todo.id === undefined) return;
    const result = await todoTable.update({ completed: !todo.completed }).eq("id", todo.id);
    if (result.error) {
      setMessage("更新 todo 失败");
      return;
    }
    await loadTodos();
  }

  async function removeTodo(todo: Todo) {
    if (todo.id === undefined) return;
    const result = await todoTable.delete().eq("id", todo.id);
    if (result.error) {
      setMessage("删除 todo 失败");
      return;
    }
    await loadTodos();
  }

  return (
    <main className="page-wrap mx-auto max-w-2xl px-4 pb-12 pt-14">
      <header className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          CloudBase CRUD
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Todo 类型测试</h1>
        <p className="mt-3 text-muted-foreground">增删改查都通过生成的 PostgreSQL 类型约束。</p>
      </header>

      <form className="mb-6 flex gap-3" onSubmit={createTodo}>
        <input
          className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="添加一个 todo"
          aria-label="Todo 标题"
        />
        <Button type="submit">新增</Button>
      </form>

      {message ? <p className="mb-4 text-sm text-destructive">{message}</p> : null}

      <section className="divide-y rounded-lg border bg-card">
        {loading ? <p className="p-6 text-sm text-muted-foreground">加载中...</p> : null}
        {!loading && todos.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">还没有 todo</p>
        ) : null}
        {todos.map((todo) => (
          <div className="flex items-center gap-3 p-4" key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed ?? false}
              onChange={() => void toggleTodo(todo)}
              aria-label={`完成 ${todo.title}`}
            />
            <span
              className={`min-w-0 flex-1 ${todo.completed ? "text-muted-foreground line-through" : ""}`}
            >
              {todo.title}
            </span>
            <Button type="button" variant="outline" size="sm" onClick={() => void removeTodo(todo)}>
              删除
            </Button>
          </div>
        ))}
      </section>
    </main>
  );
}
