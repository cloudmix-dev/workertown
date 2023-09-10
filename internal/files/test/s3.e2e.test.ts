import test from "ava";

import { type FilesAdapter } from "../src";
import { S3FilesAdapter } from "../src/s3";
import { testFilesAdapterE2E } from "./_e2e";

test("S3FilesAdapter", async (t) => {
  // @ts-ignore - weird test TS issues
  const storage = new S3FilesAdapter({
    credentials: {
      accessKeyId: "workertown",
      secretAccessKey: "workertown",
    },
    endpoint: "http://localhost:3005",
    bucket: "test",
  }) as FilesAdapter;

  await testFilesAdapterE2E(t, storage);
});
