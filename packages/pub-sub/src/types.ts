import {
  type CreateServerOptions as BaseCreateServerOptions,
  type Context as WorkertownContext,
} from "@workertown/hono";

import { type QueueAdapter } from "./queue/index.js";
import { type StorageAdapter } from "./storage/index.js";

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

export type Context = WorkertownContext<{
  config: CreateServerOptions;
  queue: QueueAdapter;
  storage: StorageAdapter;
}>;
