import test from "ava";
import crypto from "node:crypto";

import { type QueueAdapter } from "../../src/queue";
import { MemoryQueueAdapter } from "../../src/queue/memory";
import { testQueueAdapterE2E } from "./_e2e";

test.before(() => {
  globalThis.crypto = crypto.webcrypto as Crypto;
});

test("MemoryStorageAdapter", async (t) => {
  const storage = new MemoryQueueAdapter() as unknown as QueueAdapter;

  await testQueueAdapterE2E(t, storage);
});
