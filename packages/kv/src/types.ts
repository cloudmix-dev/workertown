import { type ServerOptions as BaseServerOptions } from "@workertown/internal-server";

import { type StorageAdapter } from "./storage/index.js";

export interface ServerOptions extends BaseServerOptions {
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
  runtime?: RuntimeResolver;
}

export type Context = {
  config: ServerOptions;
  storage: StorageAdapter;
};

export interface Runtime {
  storage: StorageAdapter;
}

export type RuntimeResolver =
  | Runtime
  | ((config: ServerOptions, env: Record<string, unknown>) => Runtime);
