import test from "ava";

import { type StorageAdapter } from "../../src/storage";
import { UpstashRedisStorageAdapter } from "../../src/storage/upstash-redis";
import { testStorageAdapterE2E } from "./_e2e";

test("UpstashRedisStorageAdapter", async (t) => {
  // @ts-ignore - weird test TS issues
  const storage = new UpstashRedisStorageAdapter({
    url: "http://localhost:3001",
    token: "",
  }) as unknown as StorageAdapter;

  await testStorageAdapterE2E(t, storage);
});
