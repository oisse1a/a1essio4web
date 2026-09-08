# @repo/cloudbase

CloudBase JavaScript SDK and CLI configuration for this monorepo.

## TCB CLI

The package uses `@cloudbase/cli@3.8.1` as a development dependency. Its supported executable is `tcb`. Run commands from `packages/cloudbase` with `vp`:

```bash
vp run tcb:help
vp run tcb:login
vp run pg:pull:dry
vp run pg:pull
vp run pg:push:dry
vp run pg:push
vp run pg:types
```

The CLI reads [cloudbaserc.json](cloudbaserc.json), which selects the configured CloudBase environment without storing credentials. `pg:pull` runs `tcb db pg migration fetch`; `pg:push` runs `tcb db pg migration up`. The dry-run variants only preview changes.

`pg:types` calls `tcb db execute` against PostgreSQL `information_schema.columns` and generates [src/generated/database.ts](src/generated/database.ts). The current CLI does not provide a dedicated `pg types` command, so this keeps type pulling on the official `tcb` database API.

Copy [.env.example](.env.example) to `.env` for local SDK configuration. `.env` is ignored by Git. Do not put secret credentials in `VITE_` variables because Vite exposes them to browser bundles.

## SDK

```ts
import { createCloudbaseClient } from "@repo/cloudbase";

const client = createCloudbaseClient({
  env: import.meta.env.VITE_CLOUDBASE_ENV_ID,
  region: import.meta.env.VITE_CLOUDBASE_REGION,
});

const result = await client.sql.pull<{ id: number; title: string }>(
  "select id, title from todos where id = :id",
  { id: 1 },
);
```

`sql.pull` calls the SDK's parameterized `$runSQL`; `sql.push` calls `$runSQLRaw` for raw SQL. Both return `{ rows, total, backendExecute, requestId }`.
