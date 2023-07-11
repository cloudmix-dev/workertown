import { type D1Database, type KVNamespace } from "@cloudflare/workers-types";
import { createServer } from "@workertown/hono";
import { type DeepPartial } from "@workertown/internal-types";
import { HTTPException } from "hono/http-exception";
import merge from "lodash.merge";

import { CacheAdapter, KVCacheAdapter, NoOpCacheAdapter } from "./cache";
import { DEFAULT_SCAN_RANGE, DEFAUlT_STOP_WORDS } from "./constants";
import {
  adminRouter,
  itemsRouter,
  publicRouter,
  searchRouter,
  suggestRouter,
  tagsRouter,
} from "./routers";
import { StorageAdapter } from "./storage";
import { D1StorageAdapter } from "./storage/d1-storage-adapter";
import { type Context, type CreateServerOptions } from "./types";

type CreateServerOptionsOptional = DeepPartial<CreateServerOptions>;

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
  env: {
    cache: "SEARCH_CACHE",
    database: "SEARCH_DB",
  },
  prefixes: {
    admin: "/v1/admin",
    items: "/v1/items",
    public: "/",
    search: "/v1/search",
    suggest: "/v1/suggest",
    tags: "/v1/tags",
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
    prefixes,
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
        throw new HTTPException(500, {
          message: `Database not found at env.${dbEnvKey}`,
        });
      }

      storageAdapter = new D1StorageAdapter({ db });
    }

    ctx.set("cache", cacheAdapter);
    ctx.set("config", config);
    ctx.set("storage", storageAdapter);

    return next();
  });

  server.route(prefixes.admin, adminRouter);
  server.route(prefixes.items, itemsRouter);
  server.route(prefixes.search, searchRouter);
  server.route(prefixes.suggest, suggestRouter);
  server.route(prefixes.tags, tagsRouter);
  server.route(prefixes.public, publicRouter);

  return server;
}
