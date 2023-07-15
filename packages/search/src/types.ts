import {
  type CreateServerOptions as BaseCreateServerOptions,
  type WorkertownContext,
  type WorkertownRequest,
} from "@workertown/hono";

import { type CacheAdapter } from "./cache/index.js";
import { type StorageAdapter } from "./storage/index.js";

export interface CreateServerOptions extends BaseCreateServerOptions {
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
  scanRange:
    | number
    | ((req: WorkertownRequest<any, any>) => number | Promise<number>);
  stopWords:
    | Set<string>
    | ((
        req: WorkertownRequest<any, any>
      ) => Set<string> | Promise<Set<string>>);
  storage?: StorageAdapter;
}

export type Context = WorkertownContext<{
  cache: CacheAdapter;
  config: CreateServerOptions;
  storage: StorageAdapter;
}>;
