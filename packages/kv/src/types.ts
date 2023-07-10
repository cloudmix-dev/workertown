import { type D1Database } from "@cloudflare/workers-types";
import {
  type ApiKeyOptions,
  type BasicOptions,
  type JwtOptions,
} from "@workertown/middleware";

import { type StorageAdapter } from "./storage";

export interface CreateServerOptions {
  auth?: {
    basic?: BasicOptions | false;
    jwt?: JwtOptions | false;
    apiKey?: ApiKeyOptions | false;
  };
  basePath: string;
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
