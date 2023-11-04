import { type ExecutionContext } from "ava";

import { StorageAdapter } from "../../src/storage";

export async function testStorageAdapterE2E(
  t: ExecutionContext,
  storage: StorageAdapter,
) {
  // Create tables
  const { error } = await storage.runMigrations();

  t.assert(!error, error as string);

  // Set value
  const insertResult = await storage.setValue("test", "test");

  t.is(insertResult, "test");

  // Get value
  const getResult = await storage.getValue("test");

  t.is(getResult, "test");

  const dontGetResult = await storage.getValue("other");

  t.is(dontGetResult, null);

  // Update value
  const updateResult = await storage.setValue("test", "other");

  t.is(updateResult, "other");

  const updatedGetResult = await storage.getValue("test");

  t.is(updatedGetResult, "other");

  // Delete value
  await storage.deleteValue("test");

  const deletedGetResult = await storage.getValue("test");

  t.is(deletedGetResult, null);

  // Drop tables
  await storage.runMigrations(true);
}
