import search, { type CreateServerOptions } from "../src";
import { runtime } from "../src/runtime/test";
import { type SearchDocument } from "../src/storage";

const SEARCH_DOCUMENTS: SearchDocument[] = [
  {
    id: "document_1",
    tenant: "test",
    index: "test",
    data: {
      title: "Test document 1",
      content: "This is some test content",
    },
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "document_2",
    tenant: "test",
    index: "test",
    data: {
      title: "Test document 2",
      content: "This is some more test content",
    },
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "document_3",
    tenant: "test",
    index: "test",
    data: {
      title: "Test document 3",
      content: "This doesn't contain that 't' word",
    },
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "document_4",
    tenant: "test",
    index: "other",
    data: {
      title: "Test document 4",
      content: "This index contain that 't' word",
    },
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "document_5",
    tenant: "other",
    index: "other",
    data: {
      title: "Test document 5",
      content: "This tenant or index contain that 't' word",
    },
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const TAGS = {
  test: ["document_1", "document_3"],
  other: ["document_4", "document_5"],
};

export function createTestService(
  options: CreateServerOptions = {},
  intialDocuments: SearchDocument[] = SEARCH_DOCUMENTS,
  initialTags: Record<string, string[]> = TAGS,
) {
  return search({
    ...options,
    auth: { apiKey: { apiKey: "test" } },
    logger: false,
    runtime: (config, env) =>
      runtime(config, env, {
        cache: false,
        initialDocuments: intialDocuments,
        initialTags: initialTags,
      }),
  });
}

export function makeRequest(
  service: ReturnType<typeof search>,
  path: string,
  {
    method = "GET",
    body,
  }: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown } = {},
) {
  return service.request(path, {
    method,
    headers: {
      authorization: "Bearer test",
      "content-type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
