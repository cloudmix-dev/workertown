import { MemoryFilesAdapter } from "../files/memory.js";
import { MemoryStorageAdapter } from "../storage/memory.js";
import { type UploadUrl } from "../storage/storage-adapter.js";

import { type Runtime, type ServerOptions } from "../types.js";

interface TestGetRuntimeOptions {
  initialUploadUrls: UploadUrl[];
}

export function runtime(
  // biome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
  config: ServerOptions,
  // biome-ignore lint/correctness/noUnusedVariables: not needed for this runtime
  env: Record<string, unknown>,
  options: TestGetRuntimeOptions = {
    initialUploadUrls: [],
  },
): Runtime {
  return {
    files: new MemoryFilesAdapter(),
    storage: new MemoryStorageAdapter({
      initialUploadUrls: options.initialUploadUrls,
    }),
  };
}
