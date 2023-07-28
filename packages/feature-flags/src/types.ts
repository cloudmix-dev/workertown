import {
  type CreateServerOptions as BaseCreateServerOptions,
  type WorkertownContext,
} from "@workertown/internal-hono";

import { type CacheAdapter } from "./cache/index.js";
import { type StorageAdapter } from "./storage/index.js";

export interface CreateServerOptions extends BaseCreateServerOptions {
  endpoints: {
    v1: {
      admin: string | false;
      ask: string | false;
      flags: string | false;
    };
    public: string | false;
  };
  env: {
    cache: string;
    db: string;
  };
  runtime?: RuntimeResolver;
}

export type Context = WorkertownContext<{
  cache: CacheAdapter;
  config: CreateServerOptions;
  storage: StorageAdapter;
}>;

export interface Runtime {
  cache: CacheAdapter | false;
  storage: StorageAdapter;
}

export interface GetRuntimeOptions {
  cache: boolean;
}

export type RuntimeResolver =
  | Runtime
  | ((
      config: CreateServerOptions,
      env: Record<string, unknown>,
      options?: GetRuntimeOptions,
    ) => Runtime);
