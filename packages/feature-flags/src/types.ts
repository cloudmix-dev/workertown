import { type ServerOptions as BaseServerOptions } from "@workertown/internal-server";

import { type CacheAdapter } from "./cache/index.js";
import { type StorageAdapter } from "./storage/index.js";

export interface ServerOptions extends BaseServerOptions {
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

export type Context = {
  cache: CacheAdapter;
  config: ServerOptions;
  storage: StorageAdapter;
};

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
      config: ServerOptions,
      env: Record<string, unknown>,
      options?: GetRuntimeOptions,
    ) => Runtime);
