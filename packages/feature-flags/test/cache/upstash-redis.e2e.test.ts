import test from "ava";

import { type CacheAdapter } from "../../src/cache";
import { UpstashRedisCacheAdapter } from "../../src/cache/upstash-redis";
import { testCacheAdapterE2E } from "./_e2e";

test("UpstashRedisCacheAdapter", async (t) => {
  // @ts-ignore - weird test TS issues
  const cache = new UpstashRedisCacheAdapter({
    url: "http://localhost:3001",
    token: "",
  }) as unknown as CacheAdapter;

  await testCacheAdapterE2E(t, cache);
});
