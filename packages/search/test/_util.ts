import search, { type CreateServerOptions } from "../src";
import { type SearchItem } from "../src/storage";
import { MemoryStorageAdapter } from "../src/storage/memory-storage-adapter";

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: "item_1",
    tenant: "test",
    index: "test",
    data: {
      title: "Test item 1",
      content: "This is some test content",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "item_2",
    tenant: "test",
    index: "test",
    data: {
      title: "Test item 2",
      content: "This is some more test content",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "item_3",
    tenant: "test",
    index: "test",
    data: {
      title: "Test item 3",
      content: "This doesn't contain that 't' word",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "item_4",
    tenant: "test",
    index: "other",
    data: {
      title: "Test item 4",
      content: "This index contain that 't' word",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "item_5",
    tenant: "other",
    index: "other",
    data: {
      title: "Test item 5",
      content: "This tenant or index contain that 't' word",
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const TAGS = {
  test: ["item_1", "item_3"],
  other: ["item_4", "item_5"],
};

export function createTestService(
  options: CreateServerOptions = {},
  intialData: SearchItem[] = SEARCH_ITEMS,
  tags: Record<string, string[]> = TAGS
) {
  return search({
    ...options,
    auth: { apiKey: { apiKey: "test" } },
    storage: new MemoryStorageAdapter(intialData, tags),
  });
}

export function makeRequest(
  service: ReturnType<typeof search>,
  path: string,
  {
    method = "GET",
    body,
  }: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: any } = {}
) {
  return service.fetch(
    new Request(`http://search.local${path}`, {
      method,
      headers: {
        authorization: "Bearer test",
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  );
}
