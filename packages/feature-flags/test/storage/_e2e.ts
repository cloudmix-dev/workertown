import { type ExecutionContext } from "ava";

import { type FlagConditionOperator, StorageAdapter } from "../../src/storage";

export async function testStorageAdapterE2E(
  t: ExecutionContext,
  storage: StorageAdapter,
) {
  // Create tables
  await storage.runMigrations();

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

  // Insert flag
  const insertResult = await storage.upsertFlag(featureFlags[0]);

  t.is(insertResult.name, featureFlags[0].name);
  t.is(insertResult.description, featureFlags[0].description);
  t.is(insertResult.enabled, featureFlags[0].enabled);
  t.deepEqual(insertResult.conditions, featureFlags[0].conditions);

  await storage.upsertFlag(featureFlags[1]);

  featureFlags[0].conditions.push({
    field: "other",
    operator: "neq" as FlagConditionOperator,
    value: true,
  });

  // Update flag
  const upsertResult = await storage.upsertFlag(featureFlags[0]);

  t.deepEqual(upsertResult.conditions, featureFlags[0].conditions);

  // Get flag
  const getResult = await storage.getFlag(featureFlags[0].name);

  t.is(getResult?.name, featureFlags[0].name);

  // Get all flags
  const getAllResult = await storage.getFlags();

  t.is(getAllResult.length, 2);
  t.is(getAllResult[0].name, featureFlags[0].name);

  // Delete flag
  await storage.deleteFlag(featureFlags[0].name);

  const dontGetResult = await storage.getFlag(featureFlags[0].name);

  t.is(dontGetResult, null);

  // Drop tables
  await storage.runMigrations(true);
}
