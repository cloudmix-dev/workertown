import search, { type CreateServerOptions } from "../src";
import { StorageAdapter } from "../src/storage";
import { MemoryStorageAdapter } from "../src/storage/memory-storage-adapter";

const VALUES: { key: string; value: any }[] = [
  {
    key: "test/1",
    value: "test",
  },
  {
    key: "test/2",
    value: {
      test: true,
    },
  },
];

export function createTestService(
  options: CreateServerOptions = {},
  intialValues: { key: string; value: any }[] = VALUES
) {
  return search({
    ...options,
    auth: { apiKey: { apiKey: "test" } },
    // The `as unknown` here fixes some weird Typescript bug...
    storage: new MemoryStorageAdapter(
      intialValues
    ) as unknown as StorageAdapter,
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
