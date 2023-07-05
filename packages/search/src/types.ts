import { type D1Database } from "@cloudflare/workers-types";
import {
  type ApiKeyOptions,
  type BasicOptions,
  type JwtOptions,
} from "@workertown/middleware";

import { type CacheAdapter } from "./cache";
import { type StorageAdapter } from "./storage";

export interface CreateServerOptions {
  auth?: {
    basic?: BasicOptions | false;
    jwt?: JwtOptions | false;
    apiKey?: ApiKeyOptions | false;
  };
  cache?: CacheAdapter;
  env: {
    cache: string;
    database: string;
  };
  prefixes: {
    admin: string;
    items: string;
    public: string;
    search: string;
    suggest: string;
    tags: string;
  };
  scanRange: number;
  stopWords: Set<string>;
  storage?: StorageAdapter;
}

export type ContextBindings = {
  Bindings: Env;
  Variables: {
    cache: CacheAdapter;
    config: CreateServerOptions;
    storage: StorageAdapter;
  };
};

export interface Env {
  [x: string]: string | D1Database | undefined;
}
