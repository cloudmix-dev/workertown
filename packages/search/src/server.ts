import { createServer } from "@workertown/internal-hono";
import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { NoOpCacheAdapter } from "./cache/no-op-cache-adapter.js";
import { DEFAULT_SCAN_RANGE, DEFAUlT_STOP_WORDS } from "./constants.js";
import { v1 } from "./routers/index.js";
import { getRuntime as getCloudflareWorkersRuntime } from "./runtime/cloudflare-workers.js";

import { type Context, type CreateServerOptions } from "./types.js";

export type CreateServerOptionsOptional = DeepPartial<CreateServerOptions>;

const DEFAULT_OPTIONS: CreateServerOptions = {
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
  scanRange: DEFAULT_SCAN_RANGE,
  stopWords: DEFAUlT_STOP_WORDS,
};

export function createSearchServer(options?: CreateServerOptionsOptional) {
  const config = merge({}, DEFAULT_OPTIONS, options);
  const {
    endpoints,
    runtime = getCloudflareWorkersRuntime,
    ...baseConfig
  } = config;

  const server = createServer<Context>(baseConfig);

  server.use(async (ctx, next) => {
    const { cache, storage } =
      typeof runtime === "function"
        ? runtime(config, ctx.env)
        : runtime ?? getCloudflareWorkersRuntime(config, ctx.env);

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
    server.route(endpoints.public, v1.publicRouter);
  }

  return server;
}
