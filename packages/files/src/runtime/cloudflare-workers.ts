import { type D1Database, type R2Bucket } from "@cloudflare/workers-types";

import { R2FilesAdapter } from "../files/r2.js";
import { D1StorageAdapter } from "../storage/d1.js";
import { type Runtime, type ServerOptions } from "../types.js";

export function runtime(
  config: ServerOptions,
  env: Record<string, unknown>,
): Runtime {
  const d1 = env[config.env.db] as D1Database;
  const r2 = env[config.env.files] as R2Bucket;

  return {
    files: new R2FilesAdapter({ r2 }),
    storage: new D1StorageAdapter({ d1 }),
  };
}
