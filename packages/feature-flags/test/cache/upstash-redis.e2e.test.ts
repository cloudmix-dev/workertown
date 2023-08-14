import test from "ava";
import { v2 as compose } from "docker-compose";

import { type CacheAdapter } from "../../src/cache";
import { UpstashRedisCacheAdapter } from "../../src/cache/upstash-redis";
import { testCacheAdapterE2E } from "./_e2e";

test("UpstashRedisCacheAdapter", async (t) => {
  // @ts-ignore - weird test TS issues
  const cache = new UpstashRedisCacheAdapter({
    url: "http://localhost:3001",
    token: "",
  }) as unknown as CacheAdapter;

  await compose.upOne("upstash_redis");

  await testCacheAdapterE2E(t, cache);

  await compose.execCompose("kill", "upstash_redis");
  await compose.execCompose("kill", "redis");
});
