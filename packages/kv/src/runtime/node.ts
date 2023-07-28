import { SqliteStorageAdapter } from "../storage/sqlite.js";
import { type CreateServerOptions, type Runtime } from "../types.js";

export function runtime(
  config: CreateServerOptions,
  env: Record<string, unknown>,
): Runtime {
  const db = env[config.env.db] as string;

  return {
    storage: new SqliteStorageAdapter(
      db.endsWith(".sqlite") ? { db } : undefined,
    ),
  };
}
