import test from "ava";
import { v2 as compose } from "docker-compose";
import crypto from "node:crypto";

import { type StorageAdapter } from "../../src/storage";
import { DynamoDBStorageAdapter } from "../../src/storage/dynamodb";
import { testStorageAdapterE2E } from "./_e2e";

test.before(() => {
  globalThis.crypto = crypto.webcrypto as Crypto;
});

test("DynamoDBStorageAdapter", async (t) => {
  const storage = new DynamoDBStorageAdapter({
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
    region: "us-east-1",
    endpoint: "http://localhost:3002",
    options: {
      billingMode: "PROVISIONED",
      readCapacityUnits: 1,
      writeCapacityUnits: 1,
    },
  }) as unknown as StorageAdapter;

  await compose.upOne("dynamodb");

  await testStorageAdapterE2E(t, storage);

  await compose.execCompose("kill", "dynamodb");
});
