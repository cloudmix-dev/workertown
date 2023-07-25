import { MemoryQueueAdapter } from "../queue/memory-queue-adapter.js";
import { MemoryStorageAdapter } from "../storage/memory-storage-adapter.js";
import { type Subscription } from "../storage/storage-adapter.js";
import { type CreateServerOptions, type Runtime } from "../types.js";

interface TestGetRuntimeOptions {
  initialSubscriptions?: Subscription[];
}

export function getRuntime(
  // rome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
  config: CreateServerOptions,
  // rome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
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
