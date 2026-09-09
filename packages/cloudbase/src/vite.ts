import { createCloudbaseClient } from "./client";

export * from "./client";
export * from "./database";
export type { Database } from "./database.types";

export const cloudbase = createCloudbaseClient({
  env: import.meta.env.VITE_CLOUDBASE_ENV_ID,
  region: import.meta.env.VITE_CLOUDBASE_REGION,
  accessKey: import.meta.env.VITE_CLOUDBASE_ACCESS_KEY,
});
