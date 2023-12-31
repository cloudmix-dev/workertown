import { type Server, createServer } from "@workertown/internal-server";
import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { type FilesAdapter } from "./files/files-adapter.js";
import { publicRouter, v1 } from "./routers/index.js";
import { runtime as cloudflareWorkersRuntime } from "./runtime/cloudflare-workers.js";
import { type StorageAdapter } from "./storage/storage-adapter.js";
import { type Context, type ServerOptions } from "./types.js";

export type ServerOptionsOptional = DeepPartial<ServerOptions>;

const DEFAULT_OPTIONS: ServerOptions = {
  auth: {
    apiKey: {
      env: {
        apiKey: "FILES_API_KEY",
      },
    },
    basic: {
      env: {
        username: "FILES_USERNAME",
        password: "FILES_PASSWORD",
      },
    },
    jwt: {
      env: {
        jwksUrl: "FILES_JWKS_URL",
        secret: "FILES_JWT_SECRET",
        audience: "FILES_JWT_AUDIENCE",
        issuer: "FILES_JWT_ISSUER",
      },
    },
  },
  endpoints: {
    v1: {
      admin: "/v1/admin",
      files: "/v1/files",
      uploads: "/v1/uploads",
    },
    public: "/",
  },
  env: {
    db: "FILES_DB",
    files: "FILES_FILES",
    signingKey: "FILES_SIGNING_KEY",
  },
  files: {
    uploadUrlTtl: 10 * 60,
  },
};

export function createFilesServer(
  options?: ServerOptionsOptional,
): Server<Context> {
  const config = merge({}, DEFAULT_OPTIONS, options);
  const {
    endpoints,
    runtime = cloudflareWorkersRuntime,
    ...baseConfig
  } = config;

  const server = createServer<Context>(baseConfig);
  let storage: StorageAdapter;
  let files: FilesAdapter;

  server.use("*", async (ctx, next) => {
    if (!storage) {
      ({ files, storage } =
        typeof runtime === "function"
          ? runtime(config, ctx.env)
          : runtime ?? cloudflareWorkersRuntime(config, ctx.env));
    }

    ctx.set("config", config);
    ctx.set("storage", storage);
    ctx.set("files", files);

    return next();
  });

  if (endpoints.v1.admin !== false) {
    server.route(endpoints.v1.admin, v1.adminRouter);
  }

  if (endpoints.v1.files !== false) {
    server.route(endpoints.v1.files, v1.filesRouter);
  }

  if (endpoints.v1.uploads !== false) {
    server.route(endpoints.v1.uploads, v1.uploadsRouter);
  }

  if (endpoints.public !== false) {
    server.route(endpoints.public, publicRouter);
  }

  return server;
}
