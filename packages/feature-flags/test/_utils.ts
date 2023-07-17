import search, { type CreateServerOptions } from "../src";
import { type Flag, type StorageAdapter } from "../src/storage";
import { MemoryStorageAdapter } from "../src/storage/memory-storage-adapter";

const FLAGS: Flag[] = [
  {
    name: "on",
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "off",
    enabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "off",
    enabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "eq",
    enabled: true,
    conditions: [
      {
        field: "test",
        operator: "eq",
        value: "test",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "neq",
    enabled: true,
    conditions: [
      {
        field: "test",
        operator: "neq",
        value: "test",
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "gt",
    enabled: true,
    conditions: [
      {
        field: "test",
        operator: "gt",
        value: 1,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "gte",
    enabled: true,
    conditions: [
      {
        field: "test",
        operator: "gte",
        value: 1,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "lt",
    enabled: true,
    conditions: [
      {
        field: "test",
        operator: "lt",
        value: 1,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "lte",
    enabled: true,
    conditions: [
      {
        field: "test",
        operator: "lte",
        value: 1,
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "in",
    enabled: true,
    conditions: [
      {
        field: "test",
        operator: "in",
        value: ["test"],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "nin",
    enabled: true,
    conditions: [
      {
        field: "test",
        operator: "nin",
        value: ["test"],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function createTestService(
  options: CreateServerOptions = {},
  intialFlags: Flag[] = FLAGS
) {
  return search({
    ...options,
    auth: { apiKey: { apiKey: "test" } },
    // The `as unknown` here fixes some weird Typescript bug...
    storage: new MemoryStorageAdapter(intialFlags) as unknown as StorageAdapter,
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
    new Request(`http://feature-flags.local${path}`, {
      method,
      headers: {
        authorization: "Bearer test",
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  );
}
