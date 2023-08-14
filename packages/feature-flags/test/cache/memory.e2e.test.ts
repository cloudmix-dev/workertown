import test from "ava";

import { type CacheAdapter } from "../../src/cache";
import { MemoryCacheAdapter } from "../../src/cache/memory";
import { testCacheAdapterE2E } from "./_e2e";

test("MemoryCacheAdapter", async (t) => {
  const cache = new MemoryCacheAdapter() as unknown as CacheAdapter;

  await testCacheAdapterE2E(t, cache);
});
