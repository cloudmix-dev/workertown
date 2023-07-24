import { NoOpCacheAdapter } from "../cache/no-op-cache-adapter.js";
import { MemoryStorageAdapter } from "../storage/memory-storage-adapter.js";
import { type Flag } from "../storage/storage-adapter.js";
import {
  type CreateServerOptions,
  type GetRuntimeOptions,
  type Runtime,
} from "../types.js";

interface TestGetRuntimeOptions extends GetRuntimeOptions {
  initialFlags: Flag[];
}

export function getRuntime(
  config: CreateServerOptions,
  env: Record<string, unknown>,
  options: TestGetRuntimeOptions = {
    cache: true,
    initialFlags: [],
  },
): Runtime {
  return {
    cache: new NoOpCacheAdapter(),
    storage: new MemoryStorageAdapter({
      initialFlags: options.initialFlags,
    }),
  };
}
