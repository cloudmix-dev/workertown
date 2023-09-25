import { MemoryStorageAdapter } from "../storage/memory.js";

import { type Runtime, type ServerOptions } from "../types.js";

interface TestGetRuntimeOptions {
  initialValues: Record<string, unknown>;
}

export function runtime(
  // biome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
  config: ServerOptions,
  // biome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
  env: Record<string, unknown>,
  options: TestGetRuntimeOptions = {
    initialValues: {},
  },
): Runtime {
  return {
    storage: new MemoryStorageAdapter({
      initialValues: options.initialValues,
    }),
  };
}
