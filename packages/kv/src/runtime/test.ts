import { MemoryStorageAdapter } from "../storage/memory.js";

import { type CreateServerOptions, type Runtime } from "../types.js";

interface TestGetRuntimeOptions {
  initialValues: Record<string, unknown>;
}

export function getRuntime(
  // rome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
  config: CreateServerOptions,
  // rome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
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
