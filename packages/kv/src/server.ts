import { createServer } from "@workertown/internal-hono";
import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { publicRouter, v1 } from "./routers/index.js";
import { runtime as cloudflareWorkersRuntime } from "./runtime/cloudflare-workers.js";
import { type StorageAdapter } from "./storage/storage-adapter.js";
import { type Context, type CreateServerOptions } from "./types.js";

export type CreateServerOptionsOptional = DeepPartial<CreateServerOptions>;

const DEFAULT_OPTIONS: CreateServerOptions = {
  auth: {
    apiKey: {
      env: {
        apiKey: "KV_API_KEY",
      },
    },
    basic: {
      env: {
        username: "KV_USERNAME",
        password: "KV_PASSWORD",
      },
    },
    jwt: {
      env: {
        jwksUrl: "KV_JWKS_URL",
        secret: "KV_JWT_SECRET",
        audience: "KV_JWT_AUDIENCE",
        issuer: "KV_JWT_ISSUER",
      },
    },
  },
  endpoints: {
    v1: {
      admin: "/v1/admin",
      kv: "/v1/kv",
    },
    public: "/",
  },
  env: {
    db: "KV_DB",
  },
};

export function createKvServer(options?: CreateServerOptionsOptional) {
  const config = merge({}, DEFAULT_OPTIONS, options);
  const {
    endpoints,
    runtime = cloudflareWorkersRuntime,
    ...baseConfig
  } = config;

  const server = createServer<Context>(baseConfig);
  let storage: StorageAdapter;

  server.use(async (ctx, next) => {
    if (!storage) {
      ({ storage } =
        typeof runtime === "function"
          ? runtime(config, ctx.env)
          : runtime ?? cloudflareWorkersRuntime(config, ctx.env));
    }

    ctx.set("config", config);
    ctx.set("storage", storage);

    return next();
  });

  if (endpoints.v1.admin !== false) {
    server.route(endpoints.v1.admin, v1.adminRouter);
  }

  if (endpoints.v1.kv !== false) {
    server.route(endpoints.v1.kv, v1.kvRouter);
  }

  if (endpoints.public !== false) {
    server.route(endpoints.public, publicRouter);
  }

  return server;
}
