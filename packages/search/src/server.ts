import { type Server, createServer } from "@workertown/internal-server";
import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { type CacheAdapter } from "./cache/index.js";
import { NoOpCacheAdapter } from "./cache/no-op.js";
import { DEFAULT_SCAN_RANGE, DEFAUlT_STOP_WORDS } from "./constants.js";
import { publicRouter, v1 } from "./routers/index.js";
import { runtime as cloudflareWorkersRuntime } from "./runtime/cloudflare-workers.js";
import { type StorageAdapter } from "./storage/storage-adapter.js";
import { type Context, type ServerOptions } from "./types.js";

export type ServerOptionsOptional = DeepPartial<ServerOptions>;

const DEFAULT_OPTIONS: ServerOptions = {
  auth: {
    apiKey: {
      env: {
        apiKey: "SEARCH_API_KEY",
      },
    },
    basic: {
      env: {
        username: "SEARCH_USERNAME",
        password: "SEARCH_PASSWORD",
      },
    },
    jwt: {
      env: {
        jwksUrl: "SEARCH_JWKS_URL",
        secret: "SEARCH_JWT_SECRET",
        audience: "SEARCH_JWT_AUDIENCE",
        issuer: "SEARCH_JWT_ISSUER",
      },
    },
  },
  endpoints: {
    v1: {
      admin: "/v1/admin",
      documents: "/v1/docs",
      search: "/v1/search",
      suggest: "/v1/suggest",
      tags: "/v1/tags",
    },
    public: "/",
  },
  env: {
    cache: "SEARCH_CACHE",
    db: "SEARCH_DB",
  },
  search: {
    scanRange: DEFAULT_SCAN_RANGE,
    stopWords: DEFAUlT_STOP_WORDS,
  },
};

export function createSearchServer(
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
  let cache: CacheAdapter | false;

  server.use("*", async (ctx, next) => {
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

  if (endpoints.v1.documents !== false) {
    server.route(endpoints.v1.documents, v1.documentsRouter);
  }

  if (endpoints.v1.search !== false) {
    server.route(endpoints.v1.search, v1.searchRouter);
  }

  if (endpoints.v1.suggest !== false) {
    server.route(endpoints.v1.suggest, v1.suggestRouter);
  }

  if (endpoints.v1.tags !== false) {
    server.route(endpoints.v1.tags, v1.tagsRouter);
  }

  if (endpoints.public !== false) {
    server.route(endpoints.public, publicRouter);
  }

  return server;
}
