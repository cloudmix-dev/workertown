import { type D1Database } from "@cloudflare/workers-types";
import { type CreateServerOptions as BaseCreateServerOptions } from "@workertown/hono";

import { type StorageAdapter } from "./storage";

export interface CreateServerOptions extends BaseCreateServerOptions {
  env: {
    kv: string;
    database: string;
  };
  prefixes: {
    admin: string;
    kv: string;
    public: string;
  };
  storage?: StorageAdapter;
}

export type ContextBindings = {
  Bindings: Env;
  Variables: {
    config: CreateServerOptions;
    storage: StorageAdapter;
  };
};

export interface Env {
  [x: string]: string | D1Database | undefined;
}
