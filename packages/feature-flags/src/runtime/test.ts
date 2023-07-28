import { NoOpCacheAdapter } from "../cache/no-op-cache-adapter.js";
import { MemoryStorageAdapter } from "../storage/memory.js";
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
  // rome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
  config: CreateServerOptions,
  // rome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
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
