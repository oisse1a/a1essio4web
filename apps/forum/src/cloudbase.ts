import { createCloudbaseClient } from "@repo/cloudbase";

export const cloudbase = createCloudbaseClient({
  env: import.meta.env.VITE_CLOUDBASE_ENV_ID,
  region: import.meta.env.VITE_CLOUDBASE_REGION,
  accessKey: import.meta.env.VITE_CLOUDBASE_ACCESS_KEY,
});
