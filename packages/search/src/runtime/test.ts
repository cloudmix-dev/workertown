import { NoOpCacheAdapter } from "../cache/no-op.js";
import { MemoryStorageAdapter } from "../storage/memory.js";
import { type SearchDocument } from "../storage/storage-adapter.js";
import {
  type GetRuntimeOptions,
  type Runtime,
  type ServerOptions,
} from "../types.js";

interface TestGetRuntimeOptions extends GetRuntimeOptions {
  initialDocuments: SearchDocument[];
  initialTags: Record<string, string[]>;
}

export function runtime(
  // biome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
  config: ServerOptions,
  // biome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
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
