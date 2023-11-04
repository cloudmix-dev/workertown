import test from "ava";

import { type StorageAdapter } from "../../src/storage";
import { PostgresStorageAdapter } from "../../src/storage/postgres";
import { testStorageAdapterE2E } from "./_e2e";

test("PostgresStorageAdapter", async (t) => {
  // @ts-ignore - weird test TS issues
  const storage = new PostgresStorageAdapter({
    // @ts-ignore - weird test TS issues
    host: "127.0.0.1",
    port: 3008,
    database: "workertown",
    user: "workertown",
    password: "workertown",
  }) as unknown as StorageAdapter;

  await testStorageAdapterE2E(t, storage);
});
