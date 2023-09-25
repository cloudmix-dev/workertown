import { type ServerOptions as BaseServerOptions } from "@workertown/internal-server";

import { type QueueAdapter } from "./queue/index.js";
import { type StorageAdapter } from "./storage/index.js";

export interface ServerOptions extends BaseServerOptions {
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
    signingKey: string;
  };
  pubSub?: {
    signingKey?: string;
  };
  runtime?: RuntimeResolver;
}

export type Context = {
  config: ServerOptions;
  queue: QueueAdapter;
  storage: StorageAdapter;
};

export interface Runtime {
  storage: StorageAdapter;
  queue: QueueAdapter;
}

export type RuntimeResolver =
  | Runtime
  | ((config: ServerOptions, env: Record<string, unknown>) => Runtime);
