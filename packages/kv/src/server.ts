import { type KVNamespace } from "@cloudflare/workers-types";
import { createServer } from "@workertown/hono";
import { type DeepPartial } from "@workertown/internal-types";
import { HTTPException } from "hono/http-exception";
import merge from "lodash.merge";

import { adminRouter, kvRouter, publicRouter } from "./routers";
import { StorageAdapter } from "./storage";
import { KVStorageAdapter } from "./storage/kv-storage-adapter";
import { type Context, type CreateServerOptions } from "./types";

type CreateServerOptionsOptional = DeepPartial<CreateServerOptions>;

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
  basePath: "/",
  cors: false,
  env: {
    kv: "KV_KV",
    database: "KV_DB",
  },
  prefixes: {
    admin: "/v1/admin",
    kv: "/v1",
    public: "/",
  },
};

export function createKvServer(options?: CreateServerOptionsOptional) {
  const config = merge(DEFAULT_OPTIONS, options);
  const {
    auth: authOptions,
    basePath,
    cors,
    prefixes,
    env: { database: dbEnvKey },
    storage,
  } = config;

  const server = createServer<Context>({ auth: authOptions, basePath, cors });

  server.use(async (ctx, next) => {
    let storageAdapter: StorageAdapter | undefined = storage;

    if (!storageAdapter) {
      const kv = ctx.env[dbEnvKey] as KVNamespace | undefined;

      if (!kv) {
        throw new HTTPException(500, {
          message: `Database not found at env.${dbEnvKey}`,
        });
      }

      storageAdapter = new KVStorageAdapter({ kv });
    }

    ctx.set("config", config);
    ctx.set("storage", storageAdapter);

    return next();
  });

  server.route(prefixes.admin, adminRouter);
  server.route(prefixes.kv, kvRouter);
  server.route(prefixes.public, publicRouter);

  return server;
}
