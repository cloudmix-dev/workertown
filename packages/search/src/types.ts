import {
  type CreateServerOptions as BaseCreateServerOptions,
  type WorkertownContext,
  type WorkertownRequest,
} from "@workertown/internal-hono";
import { type SearchResult } from "minisearch";

import { type CacheAdapter } from "./cache/index.js";
import { type SearchDocument, type StorageAdapter } from "./storage/index.js";

export interface CreateServerOptions extends BaseCreateServerOptions {
  boostDocument?: (document: SearchDocument, term: string) => number;
  cache?: CacheAdapter;
  endpoints: {
    v1: {
      admin: string;
      documents: string;
      public: string;
      search: string;
      suggest: string;
      tags: string;
    };
  };
  env: {
    cache: string;
    database: string;
  };
  filter?: (document: SearchDocument, result: SearchResult) => boolean;
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
