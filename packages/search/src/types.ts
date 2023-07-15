import {
  type CreateServerOptions as BaseCreateServerOptions,
  type Context as WorkertownContext,
  type Request as WorkertownRequest,
} from "@workertown/hono";

import { type CacheAdapter } from "./cache";
import { type StorageAdapter } from "./storage";

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
