import { MemoryCacheAdapter } from "../cache/memory.js";
import { SqliteStorageAdapter } from "../storage/sqlite.js";
import {
  type CreateServerOptions,
  type GetRuntimeOptions,
  type Runtime,
} from "../types.js";

export function runtime(
  config: CreateServerOptions,
  env: Record<string, unknown>,
  options: GetRuntimeOptions = { cache: true },
): Runtime {
  const db = env[config.env.db] as string;

  return {
    cache: options.cache ? new MemoryCacheAdapter() : false,
    storage: new SqliteStorageAdapter(
      db.endsWith(".sqlite") ? { db } : undefined,
    ),
  };
}
