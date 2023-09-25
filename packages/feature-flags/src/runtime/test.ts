import { NoOpCacheAdapter } from "../cache/no-op.js";
import { MemoryStorageAdapter } from "../storage/memory.js";
import { type Flag } from "../storage/storage-adapter.js";
import {
  type GetRuntimeOptions,
  type Runtime,
  type ServerOptions,
} from "../types.js";

interface TestGetRuntimeOptions extends GetRuntimeOptions {
  initialFlags: Flag[];
}

export function runtime(
  // biome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
  config: ServerOptions,
  // biome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
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
