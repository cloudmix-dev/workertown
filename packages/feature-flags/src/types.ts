import {
  type CreateServerOptions as BaseCreateServerOptions,
  type Context as WorkertownContext,
} from "@workertown/hono";

import { type StorageAdapter } from "./storage";

export interface CreateServerOptions extends BaseCreateServerOptions {
  env: {
    database: string;
  };
  prefixes: {
    admin: string;
    ask: string;
    flags: string;
    public: string;
  };
  storage?: StorageAdapter;
}

export type Context = WorkertownContext<{
  config: CreateServerOptions;
  storage: StorageAdapter;
}>;
