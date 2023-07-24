import { MemoryCacheAdapter } from "../cache/memory-cache-adapter.js";
import { SqliteStorageAdapter } from "../storage/sqlite-storage-adapter.js";
import {
  type CreateServerOptions,
  type GetRuntimeOptions,
  type Runtime,
} from "../types.js";

export function getRuntime(
  config: CreateServerOptions,
  env: Record<string, unknown>,
  options: GetRuntimeOptions = { cache: true },
): Runtime {
  return {
    cache: options.cache ? new MemoryCacheAdapter() : false,
    storage: new SqliteStorageAdapter({ db: config.env.db }),
  };
}
