import { type ServerOptions as BaseServerOptions } from "@workertown/internal-server";

import { type FilesAdapter } from "./files/files-adapter.js";
import { type StorageAdapter } from "./storage/index.js";

export interface ServerOptions extends BaseServerOptions {
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
    signingKey: string;
  };
  files: {
    uploadSigningKey?: string;
    uploadUrlTtl: number;
  };
  runtime?: RuntimeResolver;
}

export type Context = {
  config: ServerOptions;
  files: FilesAdapter;
  storage: StorageAdapter;
};

export interface Runtime {
  files: FilesAdapter;
  storage: StorageAdapter;
}

export type RuntimeResolver =
  | Runtime
  | ((config: ServerOptions, env: Record<string, unknown>) => Runtime);
