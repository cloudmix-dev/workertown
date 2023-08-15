import { D1Database, D1DatabaseAPI } from "@miniflare/d1";
import test from "ava";
import Database from "better-sqlite3";

import { type StorageAdapter } from "../../src/storage";
import { D1StorageAdapter } from "../../src/storage/d1";
import { testStorageAdapterE2E } from "./_e2e";

test("D1StorageAdapter", async (t) => {
  const sqlite = new Database(":memory:");
  const api = new D1DatabaseAPI(sqlite);
  const d1 = new D1Database(api);
  // @ts-ignore - weird test TS issues
  const storage = new D1StorageAdapter({ d1 }) as unknown as StorageAdapter;

  await testStorageAdapterE2E(t, storage);
});
