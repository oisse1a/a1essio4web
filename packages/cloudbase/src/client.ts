import cloudbaseSDK from "@cloudbase/js-sdk";
import type { TypedRdb } from "./database";

export type CloudbaseConfig = Parameters<typeof cloudbaseSDK.init>[0];
export type CloudbaseSdkClient = ReturnType<typeof cloudbaseSDK.init>;

/**
 * The SDK client with `rdb()` narrowed to the generated `Database` types.
 *
 * Only the type is narrowed: the native `rdb()` implementation is kept as-is,
 * so calls reach the environment PostgreSQL instance via `/rdb/rest`.
 */
export type CloudbaseClient = Omit<CloudbaseSdkClient, "rdb"> & {
  rdb: () => TypedRdb;
};

export function createCloudbaseClient(config: CloudbaseConfig): CloudbaseClient {
  return cloudbaseSDK.init(config) as unknown as CloudbaseClient;
}
