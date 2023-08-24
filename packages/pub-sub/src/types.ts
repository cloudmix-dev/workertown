import {
  type Context as WorkertownContext,
  type CreateServerOptions as BaseCreateServerOptions,
} from "@workertown/internal-server";

import { type QueueAdapter } from "./queue/index.js";
import { type StorageAdapter } from "./storage/index.js";

export interface CreateServerOptions extends BaseCreateServerOptions {
  endpoints: {
    v1: {
      admin: string;
      publish: string;
      subscriptions: string;
    };
    public: string;
  };
  env: {
    db: string;
    queue: string;
  };
  runtime?: RuntimeResolver;
}

export type Context = WorkertownContext<{
  config: CreateServerOptions;
  queue: QueueAdapter;
  storage: StorageAdapter;
}>;

export interface Runtime {
  storage: StorageAdapter;
  queue: QueueAdapter;
}

export type RuntimeResolver =
  | Runtime
  | ((config: CreateServerOptions, env: Record<string, unknown>) => Runtime);
