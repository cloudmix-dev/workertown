import { type D1Database, type KVNamespace } from "@cloudflare/workers-types";
import { createServer } from "@workertown/internal-hono";
import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { CacheAdapter } from "./cache/index.js";
import { KVCacheAdapter } from "./cache/kv-cache-adapter.js";
import { NoOpCacheAdapter } from "./cache/no-op-cache-adapter.js";
import { DEFAULT_SCAN_RANGE, DEFAUlT_STOP_WORDS } from "./constants.js";
import { v1 } from "./routers/index.js";
import { D1StorageAdapter } from "./storage/d1-storage-adapter.js";
import { StorageAdapter } from "./storage/index.js";
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
  basePath: "/",
  cors: false,
  endpoints: {
    v1: {
      admin: "/v1/admin",
      documents: "/v1/docs",
      public: "/",
      search: "/v1/search",
      suggest: "/v1/suggest",
      tags: "/v1/tags",
    },
  },
  env: {
    cache: "SEARCH_CACHE",
    database: "SEARCH_DB",
  },
  scanRange: DEFAULT_SCAN_RANGE,
  stopWords: DEFAUlT_STOP_WORDS,
};

export function createSearchServer(options?: CreateServerOptionsOptional) {
  const config = merge(DEFAULT_OPTIONS, options);
  const {
    auth: authOptions,
    basePath,
    cache,
    cors,
    endpoints,
    env: { cache: cacheEnvKey, database: dbEnvKey },
    storage,
  } = config;

  const server = createServer<Context>({ auth: authOptions, basePath, cors });

  server.use(async (ctx, next) => {
    let cacheAdapter: CacheAdapter | undefined = cache;
    let storageAdapter: StorageAdapter | undefined = storage;

    if (!cacheAdapter) {
      const kv = ctx.env[cacheEnvKey] as KVNamespace | undefined;

      if (!kv) {
        cacheAdapter = new NoOpCacheAdapter();
      } else {
        cacheAdapter = new KVCacheAdapter(kv);
      }
    }

    if (!storageAdapter) {
      const db = ctx.env[dbEnvKey] as D1Database | undefined;

      if (!db) {
        return ctx.json({
          status: 500,
          success: false,
          data: null,
          error: `Database not found at env.${dbEnvKey}`,
        });
      }

      storageAdapter = new D1StorageAdapter({ db });
    }

    ctx.set("cache", cacheAdapter);
    ctx.set("config", config);
    ctx.set("storage", storageAdapter);

    return next();
  });

  server.route(endpoints.v1.admin, v1.adminRouter);
  server.route(endpoints.v1.documents, v1.documentsRouter);
  server.route(endpoints.v1.search, v1.searchRouter);
  server.route(endpoints.v1.suggest, v1.suggestRouter);
  server.route(endpoints.v1.tags, v1.tagsRouter);
  server.route(endpoints.v1.public, v1.publicRouter);

  return server;
}
