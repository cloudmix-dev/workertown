import { type KVNamespace } from "@cloudflare/workers-types";

import { KVStorageAdapter } from "../storage/kv.js";
import { type Runtime, type ServerOptions } from "../types.js";

export function runtime(
  config: ServerOptions,
  env: Record<string, unknown>,
): Runtime {
  const kv = env[config.env.db] as KVNamespace;

  return {
    storage: new KVStorageAdapter({ kv }),
  };
}
