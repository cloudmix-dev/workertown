import { type ExecutionContext } from "ava";
import crypto from "node:crypto";

import { type CreateUploadUrlBody, StorageAdapter } from "../../src/storage";

globalThis.crypto = crypto.webcrypto as Crypto;

export async function testStorageAdapterE2E(
  t: ExecutionContext,
  storage: StorageAdapter,
) {
  // Create tables
  await storage.runMigrations();

  const uploadUrls: CreateUploadUrlBody[] = [
    {
      path: "/test/1.txt",
      callbackUrl: "http://localhost:3000",
      metadata: {
        test: "test",
      },
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  ];

  // Insert upload URL
  const insertResult = await storage.createUploadUrl(uploadUrls[0]);

  t.is(insertResult.path, uploadUrls[0].path);
  t.is(insertResult.callbackUrl, uploadUrls[0].callbackUrl);
  t.deepEqual(insertResult.metadata, uploadUrls[0].metadata);
  t.is(insertResult.expiresAt.getTime(), uploadUrls[0].expiresAt.getTime());

  // Get upload URL
  const getResult = await storage.getUploadUrl(insertResult.id);

  t.deepEqual(getResult?.id, getResult?.id);

  // Delete search document
  await storage.deleteUploadUrl(insertResult.id);

  const dontGetResult = await storage.getUploadUrl(insertResult.id);

  t.is(dontGetResult, null);

  // Drop tables
  await storage.runMigrations(true);
}
