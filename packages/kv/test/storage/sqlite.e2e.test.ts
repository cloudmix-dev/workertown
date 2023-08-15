import test from "ava";

import { type StorageAdapter } from "../../src/storage";
import { SqliteStorageAdapter } from "../../src/storage/sqlite";
import { testStorageAdapterE2E } from "./_e2e";

test("SqliteStorageAdapter", async (t) => {
  // @ts-ignore - weird test TS issues
  const storage = new SqliteStorageAdapter({
    db: ":memory:",
  }) as unknown as StorageAdapter;

  await testStorageAdapterE2E(t, storage);
});
