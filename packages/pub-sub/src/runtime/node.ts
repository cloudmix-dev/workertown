import { SqliteQueueAdapter } from "../queue/sqlite.js";
import { SqliteStorageAdapter } from "../storage/sqlite.js";
import { type CreateServerOptions, type Runtime } from "../types.js";

export function runtime(
  config: CreateServerOptions,
  env: Record<string, unknown>,
): Runtime {
  const db = env[config.env.db] as string;
  const queue = env[config.env.queue] as string;

  return {
    queue: new SqliteQueueAdapter(
      queue.endsWith(".sqlite") ? { db: queue } : undefined,
    ),
    storage: new SqliteStorageAdapter(
      db.endsWith(".sqlite") ? { db } : undefined,
    ),
  };
}
