import { R2Bucket } from "@miniflare/r2";
import { MemoryStorage } from "@miniflare/storage-memory";
import test from "ava";

import { type FilesAdapter } from "../src";
import { R2FilesAdapter } from "../src/r2";
import { testFilesAdapterE2E } from "./_e2e";

test("R2FilesAdapter", async (t) => {
  const r2 = new R2Bucket(new MemoryStorage());
  // @ts-ignore - weird test TS issues
  const storage = new R2FilesAdapter({ r2 }) as FilesAdapter;

  await testFilesAdapterE2E(t, storage);
});
