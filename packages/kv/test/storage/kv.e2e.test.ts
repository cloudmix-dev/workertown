import { KVNamespace } from "@miniflare/kv";
import { MemoryStorage } from "@miniflare/storage-memory";
import test from "ava";

import { type StorageAdapter } from "../../src/storage";
import { KVStorageAdapter } from "../../src/storage/kv";
import { testStorageAdapterE2E } from "./_e2e";

test("KVStorageAdapter", async (t) => {
  const kv = new KVNamespace(new MemoryStorage());
  // @ts-ignore - weird test TS issues
  const cache = new KVStorageAdapter({ kv }) as unknown as StorageAdapter;

  await testStorageAdapterE2E(t, cache);
});
