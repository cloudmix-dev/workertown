import { type ExecutionContext } from "ava";

import { CacheAdapter } from "../../src/cache";
import { type FlagConditionOperator } from "../../src/storage/storage-adapter";

export async function testCacheAdapterE2E(
  t: ExecutionContext,
  cache: CacheAdapter,
) {
  const featureFlags = [
    {
      name: "flag_1",
      description: "A test flag",
      enabled: true,
      conditions: [
        {
          field: "test",
          operator: "eq" as FlagConditionOperator,
          value: true,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "flag_2",
      description: "A test flag",
      enabled: true,
      conditions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Set item in cache
  await cache.set("test", featureFlags);

  // get Item from cache
  const getResult = await cache.get("test");

  t.is(getResult?.[0].name, featureFlags[0].name);
  t.is(getResult?.[0].description, featureFlags[0].description);
  t.is(getResult?.[0].enabled, featureFlags[0].enabled);
  t.deepEqual(getResult?.[0].conditions, featureFlags[0].conditions);

  const dontGetResult = await cache.get("other");

  t.is(dontGetResult, null);

  // Delete item from cache
  await cache.delete("test");

  const deleteResult = await cache.get("test");

  t.is(deleteResult, null);
}
