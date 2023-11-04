import test from "ava";

import { type StorageAdapter } from "../../src/storage";
import { MysqlStorageAdapter } from "../../src/storage/mysql";
import { testStorageAdapterE2E } from "./_e2e";

test("MysqlStorageAdapter", async (t) => {
  // @ts-ignore - weird test TS issues
  const storage = new MysqlStorageAdapter({
    // @ts-ignore - weird test TS issues
    host: "127.0.0.1",
    port: 3007,
    database: "workertown",
    user: "workertown",
    password: "workertown",
  }) as unknown as StorageAdapter;

  await testStorageAdapterE2E(t, storage);
});
