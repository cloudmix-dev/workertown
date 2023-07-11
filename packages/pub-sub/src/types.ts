import { type D1Database } from "@cloudflare/workers-types";
import { type CreateServerOptions as BaseCreateServerOptions } from "@workertown/hono";

import { type QueueAdapter } from "./queue";
import { type StorageAdapter } from "./storage";

export interface CreateServerOptions extends BaseCreateServerOptions {
  env: {
    database: string;
    queue: string;
  };
  prefixes: {
    admin: string;
    public: string;
    publish: string;
    subscriptions: string;
  };
  queue?: QueueAdapter;
  storage?: StorageAdapter;
}

export type ContextBindings = {
  Bindings: Env;
  Variables: {
    config: CreateServerOptions;
    queue: QueueAdapter;
    storage: StorageAdapter;
  };
};

export interface Env {
  [x: string]: string | D1Database | undefined;
}
