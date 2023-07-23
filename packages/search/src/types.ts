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
    database: string;
  };
  filter?: (document: SearchDocument, result: SearchResult) => boolean;
  scanRange:
    | number
    // rome-ignore lint/suspicious/noExplicitAny: We don't care about the specifics of the WorkertownRequest
    | ((req: WorkertownRequest<any, any>) => number | Promise<number>);
  stopWords:
    | string[]
    | Set<string>
    | ((
        // rome-ignore lint/suspicious/noExplicitAny: We don't care about the specifics of the WorkertownRequest
        req: WorkertownRequest<any, any>,
      ) => string[] | Set<string> | Promise<string[] | Set<string>>);
  storage?: StorageAdapter;
}

export type Context = WorkertownContext<{
  cache: CacheAdapter;
  config: CreateServerOptions;
  storage: StorageAdapter;
}>;
