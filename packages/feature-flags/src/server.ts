import { createServer } from "@workertown/internal-hono";
import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { type CacheAdapter } from "./cache/index.js";
import { NoOpCacheAdapter } from "./cache/no-op.js";
import { publicRouter, v1 } from "./routers/index.js";
import { runtime as cloudflareWorkersRuntime } from "./runtime/cloudflare-workers.js";
import { type StorageAdapter } from "./storage/storage-adapter.js";
import { type Context, type CreateServerOptions } from "./types.js";

export type CreateServerOptionsOptional = DeepPartial<CreateServerOptions>;

const DEFAULT_OPTIONS: CreateServerOptions = {
  auth: {
    apiKey: {
      env: {
        apiKey: "FLAGS_API_KEY",
      },
    },
    basic: {
      env: {
        username: "FLAGS_USERNAME",
        password: "FLAGS_PASSWORD",
      },
    },
    jwt: {
      env: {
        jwksUrl: "FLAGS_JWKS_URL",
        secret: "FLAGS_JWT_SECRET",
        audience: "FLAGS_JWT_AUDIENCE",
        issuer: "FLAGS_JWT_ISSUER",
      },
    },
  },
  endpoints: {
    v1: {
      admin: "/v1/admin",
      ask: "/v1/ask",
      flags: "/v1/flags",
    },
    public: "/",
  },
  env: {
    cache: "FLAGS_CACHE",
    db: "FLAGS_DB",
  },
};

export function createFeatureFlagsServer(
  options?: CreateServerOptionsOptional,
) {
  const config = merge({}, DEFAULT_OPTIONS, options);
  const {
    endpoints,
    runtime = cloudflareWorkersRuntime,
    ...baseConfig
  } = config;

  const server = createServer<Context>(baseConfig);
  let storage: StorageAdapter;
  let cache: CacheAdapter | false;

  server.use(async (ctx, next) => {
    if (!cache && !storage) {
      ({ cache, storage } =
        typeof runtime === "function"
          ? runtime(config, ctx.env)
          : runtime ?? cloudflareWorkersRuntime(config, ctx.env));
    }

    ctx.set("cache", cache || new NoOpCacheAdapter());
    ctx.set("config", config);
    ctx.set("storage", storage);

    return next();
  });

  if (endpoints.v1.admin !== false) {
    server.route(endpoints.v1.admin, v1.adminRouter);
  }

  if (endpoints.v1.ask !== false) {
    server.route(endpoints.v1.ask, v1.askRouter);
  }

  if (endpoints.v1.flags !== false) {
    server.route(endpoints.v1.flags, v1.flagsRouter);
  }

  if (endpoints.public !== false) {
    server.route(endpoints.public, publicRouter);
  }

  return server;
}
