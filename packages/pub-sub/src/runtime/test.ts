import { MemoryQueueAdapter } from "../queue/memory.js";
import { MemoryStorageAdapter } from "../storage/memory.js";
import { type Subscription } from "../storage/storage-adapter.js";
import { type CreateServerOptions, type Runtime } from "../types.js";

interface TestGetRuntimeOptions {
  initialSubscriptions?: Subscription[];
}

export function runtime(
  // biome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
  config: CreateServerOptions,
  // biome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
  env: Record<string, unknown>,
  options: TestGetRuntimeOptions = {},
): Runtime {
  return {
    queue: new MemoryQueueAdapter(),
    storage: new MemoryStorageAdapter({
      initialSubscriptions: options.initialSubscriptions,
    }),
  };
}
