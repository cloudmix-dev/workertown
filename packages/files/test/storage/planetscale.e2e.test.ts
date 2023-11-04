import test from "ava";

import { type StorageAdapter } from "../../src/storage";
import { PlanetscaleStorageAdapter } from "../../src/storage/planetscale";
import { testStorageAdapterE2E } from "./_e2e";

test("PlanetscaleStorageAdapter", async (t) => {
  // @ts-ignore - weird test TS issues
  const storage = new PlanetscaleStorageAdapter({
    // @ts-ignore - weird test TS issues
    url: "http://localhost:3004",
    username: "workertown",
    password: "workertown",
  }) as unknown as StorageAdapter;

  await testStorageAdapterE2E(t, storage);
});
