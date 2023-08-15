import test from "ava";

import { type StorageAdapter } from "../../src/storage";
import { MemoryStorageAdapter } from "../../src/storage/memory";
import { testStorageAdapterE2E } from "./_e2e";

test("MemoryStorageAdapter", async (t) => {
  const storage = new MemoryStorageAdapter() as unknown as StorageAdapter;

  await testStorageAdapterE2E(t, storage);
});
