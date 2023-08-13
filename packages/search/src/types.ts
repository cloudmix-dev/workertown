import {
  type CreateServerOptions as BaseCreateServerOptions,
  type WorkertownContext,
} from "@workertown/internal-hono";
import { type SearchResult } from "minisearch";

import { type CacheAdapter } from "./cache/index.js";
import { type SearchDocument, type StorageAdapter } from "./storage/index.js";

export interface CreateServerOptions extends BaseCreateServerOptions {
  endpoints: {
    v1: {
      admin: string | false;
      documents: string | false;
      search: string | false;
      suggest: string | false;
      tags: string | false;
    };
    public: string | false;
  };
  env: {
    cache: string;
    db: string;
  };
  runtime?: RuntimeResolver;
  search: {
    boostDocument?: (document: SearchDocument, term: string) => number;
    filterDocument?: (
      document: SearchDocument,
      result: SearchResult,
    ) => boolean;
    scanRange: number | ((req: Request) => number | Promise<number>);
    stopWords:
      | string[]
      | Set<string>
      | ((
          req: Request,
        ) => string[] | Set<string> | Promise<string[] | Set<string>>);
  };
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

export type RuntimeResolver =
  | Runtime
  | ((
      config: CreateServerOptions,
      env: Record<string, unknown>,
      options?: GetRuntimeOptions,
    ) => Runtime);

export interface GetRuntimeOptions {
  cache: boolean;
}
