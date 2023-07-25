import {
  type CreateServerOptions as BaseCreateServerOptions,
  type WorkertownContext,
} from "@workertown/internal-hono";

import { type StorageAdapter } from "./storage/index.js";

export interface CreateServerOptions extends BaseCreateServerOptions {
  endpoints: {
    v1: {
      admin: string | false;
      kv: string | false;
    };
    public: string | false;
  };
  env: {
    db: string;
  };
  runtime?:
    | Runtime
    | ((config: CreateServerOptions, env: Record<string, unknown>) => Runtime);
}

export type Context = WorkertownContext<{
  config: CreateServerOptions;
  storage: StorageAdapter;
}>;

export interface Runtime {
  storage: StorageAdapter;
}
