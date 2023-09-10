import { KVNamespace } from "@miniflare/kv";
import { MemoryStorage } from "@miniflare/storage-memory";
import test from "ava";

import { type CacheAdapter } from "../src";
import { KVCacheAdapter } from "../src/kv";
import { testCacheAdapterE2E } from "./_e2e";

test("KVCacheAdapter", async (t) => {
  const kv = new KVNamespace(new MemoryStorage());
  // @ts-ignore - weird test TS issues
  const cache = new KVCacheAdapter({ kv }) as unknown as CacheAdapter;

  await testCacheAdapterE2E(t, cache);
});
