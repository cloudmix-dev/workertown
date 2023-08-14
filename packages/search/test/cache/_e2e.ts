import { type ExecutionContext } from "ava";

import { CacheAdapter } from "../../src/cache";

export async function testCacheAdapterE2E(
  t: ExecutionContext,
  cache: CacheAdapter,
) {
  const searchDocuments = [
    {
      id: "document_1",
      tenant: "test",
      index: "test",
      data: {
        title: "Test document 1",
        content: "This is some test content",
      },
      tags: ["test"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "document_2",
      tenant: "test",
      index: "test",
      data: {
        title: "Test document 2",
        content: "This is some other test content",
      },
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  // Set item in cache
  await cache.set("test", searchDocuments);

  // get Item from cache
  const getResult = await cache.get("test");

  t.is(getResult?.[0].id, searchDocuments[0].id);
  t.is(getResult?.[0].tenant, searchDocuments[0].tenant);
  t.is(getResult?.[0].index, searchDocuments[0].index);
  t.deepEqual(getResult?.[0].data, searchDocuments[0].data);
  t.deepEqual(getResult?.[0].tags, searchDocuments[0].tags);

  const dontGetResult = await cache.get("other");

  t.is(dontGetResult, null);

  // Delete item from cache
  await cache.delete("test");

  const deleteResult = await cache.get("test");

  t.is(deleteResult, null);
}
