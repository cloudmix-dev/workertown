import { NoOpCacheAdapter } from "../cache/no-op-cache-adapter.js";
import { MemoryStorageAdapter } from "../storage/memory-storage-adapter.js";
import { type SearchDocument } from "../storage/storage-adapter.js";
import {
  type CreateServerOptions,
  type GetRuntimeOptions,
  type Runtime,
} from "../types.js";

interface TestGetRuntimeOptions extends GetRuntimeOptions {
  initialDocuments: SearchDocument[];
  initialTags: Record<string, string[]>;
}

export function getRuntime(
  config: CreateServerOptions,
  env: Record<string, unknown>,
  options: TestGetRuntimeOptions = {
    cache: true,
    initialDocuments: [],
    initialTags: {},
  },
): Runtime {
  return {
    cache: new NoOpCacheAdapter(),
    storage: new MemoryStorageAdapter({
      initialDocuments: options.initialDocuments,
      initialTags: options.initialTags,
    }),
  };
}
