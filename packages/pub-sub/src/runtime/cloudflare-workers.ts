import { type D1Database } from "@cloudflare/workers-types";

import { CfQueuesQueueAdapter } from "../queue/cf-queues.js";
import { D1StorageAdapter } from "../storage/d1.js";
import { type Runtime, type ServerOptions } from "../types.js";

export function runtime(
  config: ServerOptions,
  env: Record<string, unknown>,
): Runtime {
  const d1 = env[config.env.db] as D1Database;
  const queue = env?.[config.env.queue] as Queue<unknown>;

  return {
    storage: new D1StorageAdapter({ d1 }),
    queue: new CfQueuesQueueAdapter({ queue }),
  };
}
