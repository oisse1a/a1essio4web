import cloudbaseSDK from "@cloudbase/js-sdk";
import { typedRdb, type TypedRdb } from "./database";

export type CloudbaseConfig = Parameters<typeof cloudbaseSDK.init>[0];
export type CloudbaseClient = Omit<ReturnType<typeof cloudbaseSDK.init>, "rdb"> & {
  rdb: () => TypedRdb;
};
export type AnonymousSession =
  | Awaited<ReturnType<ReturnType<CloudbaseClient["auth"]>["getCurrentUser"]>>
  | object;

export function createCloudbaseClient(config: CloudbaseConfig): CloudbaseClient {
  const sdkClient = cloudbaseSDK.init(config);
  return Object.assign(sdkClient, {
    rdb: () => typedRdb(sdkClient),
  });
}

export async function ensureAnonymousSession(client: CloudbaseClient): Promise<AnonymousSession> {
  const auth = client.auth();
  const currentUser = await auth.getCurrentUser();
  if (currentUser) return currentUser;

  const result = await auth.signInAnonymously();
  if (result.error) throw result.error;
  return result.data?.user ?? null;
}
