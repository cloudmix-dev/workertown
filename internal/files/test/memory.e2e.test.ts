import test from "ava";

import { type FilesAdapter } from "../src";
import { MemoryFilesAdapter } from "../src/memory";
import { testFilesAdapterE2E } from "./_e2e";

test("MemoryFilesAdapter", async (t) => {
  // @ts-ignore - weird test TS issues
  const storage = new MemoryFilesAdapter() as FilesAdapter;

  await testFilesAdapterE2E(t, storage);
});
