import {
  type CreateServerOptions as BaseCreateServerOptions,
  type Context as WorkertownContext,
} from "@workertown/internal-hono";

import { type StorageAdapter } from "./storage/index.js";

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

export type Context = WorkertownContext<{
  config: CreateServerOptions;
  storage: StorageAdapter;
}>;
