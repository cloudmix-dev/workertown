import {
  type CreateServerOptions as BaseCreateServerOptions,
  type WorkertownContext,
} from "@workertown/internal-hono";

import { type FilesAdapter } from "./files/files-adapter.js";
import { type StorageAdapter } from "./storage/index.js";

export interface CreateServerOptions extends BaseCreateServerOptions {
  endpoints: {
    v1: {
      admin: string | false;
      files: string | false;
      uploads: string | false;
    };
    public: string | false;
  };
  env: {
    db: string;
    files: string;
  };
  files: {
    uploadUrlTtl: number;
  };
  runtime?: RuntimeResolver;
}

export type Context = WorkertownContext<{
  config: CreateServerOptions;
  files: FilesAdapter;
  storage: StorageAdapter;
}>;

export interface Runtime {
  files: FilesAdapter;
  storage: StorageAdapter;
}

export type RuntimeResolver =
  | Runtime
  | ((config: CreateServerOptions, env: Record<string, unknown>) => Runtime);
