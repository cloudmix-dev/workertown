import test from "ava";

import { type StorageAdapter } from "../../src/storage";
import { TursoStorageAdapter } from "../../src/storage/turso";
import { testStorageAdapterE2E } from "./_e2e";

test("TursoStorageAdapter", async (t) => {
  // @ts-ignore - weird test TS issues
  const storage = new TursoStorageAdapter({
    url: "http://localhost:3003",
  }) as unknown as StorageAdapter;

  await testStorageAdapterE2E(t, storage);
});
