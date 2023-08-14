import { type ExecutionContext } from "ava";

import { StorageAdapter } from "../../src/storage";

export async function testStorageAdapterE2E(
  t: ExecutionContext,
  storage: StorageAdapter,
) {
  // Create tables
  await storage.runMigrations();

  const searchDocuments = [
    {
      id: "document_1",
      tenant: "test",
      index: "test",
      data: {
        title: "Test document 1",
        content: "This is some test content",
      },
    },
    {
      id: "document_2",
      tenant: "test",
      index: "test",
      data: {
        title: "Test document 2",
        content: "This is some other test content",
      },
    },
  ];

  // Insert search document
  const insertResult = await storage.upsertDocument(searchDocuments[0]);

  t.is(insertResult.id, searchDocuments[0].id);
  t.is(insertResult.tenant, searchDocuments[0].tenant);
  t.is(insertResult.index, searchDocuments[0].index);
  t.deepEqual(insertResult.data, searchDocuments[0].data);
  t.deepEqual(insertResult.tags, []);

  await storage.upsertDocument(searchDocuments[1]);

  searchDocuments[0].data.content = "This is some test content again";

  // Update search document
  const upsertResult = await storage.upsertDocument(searchDocuments[0]);

  t.deepEqual(upsertResult.data, searchDocuments[0].data);

  // Get search document
  const getResult = await storage.getDocument(searchDocuments[0].id);

  t.deepEqual(getResult?.data, searchDocuments[0].data);

  // Tag search document
  const tagResult = await storage.upsertDocument(searchDocuments[0], ["test"]);

  t.deepEqual(tagResult.tags, ["test"]);

  // Get search document by tenant
  const getByTenantResult = await storage.getDocuments({
    tenant: searchDocuments[0].tenant,
    limit: 100,
  });

  t.is(getByTenantResult.length, 2);
  t.deepEqual(getByTenantResult[0].data, searchDocuments[0].data);

  // Get search document by index
  const getByIndexResult = await storage.getDocuments({
    tenant: searchDocuments[0].tenant,
    index: searchDocuments[0].index,
    limit: 100,
  });

  t.is(getByIndexResult.length, 2);
  t.deepEqual(getByIndexResult[0].data, searchDocuments[0].data);

  // Get search document by tag
  const getByTagResult = await storage.getDocumentsByTags(["test"], {
    tenant: searchDocuments[0].tenant,
    index: searchDocuments[0].index,
    limit: 100,
  });

  t.is(getByTagResult.length, 1);
  t.deepEqual(getByTagResult[0].data, searchDocuments[0].data);

  const dontGetByTagResult = await storage.getDocumentsByTags(["other"], {
    tenant: searchDocuments[0].tenant,
    index: searchDocuments[0].index,
    limit: 1,
  });

  t.is(dontGetByTagResult.length, 0);

  // Get tags
  const getTagsResult = await storage.getTags();

  t.deepEqual(getTagsResult, ["test"]);

  // Delete search document
  await storage.deleteDocument(searchDocuments[0].id);

  const dontGetResult = await storage.getDocument(searchDocuments[0].id);

  t.is(dontGetResult, null);

  // Drop tables
  await storage.runMigrations(true);
}
