import { type KVNamespace } from "@cloudflare/workers-types";
import { type DeepPartial } from "@workertown/internal-types";
import {
  apiKey as apiKeyMiddleware,
  basic as basicMiddleware,
  jwt as jwtMiddleware,
} from "@workertown/middleware";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import merge from "lodash.merge";

import { adminRouter, kvRouter, publicRouter } from "./routers";
import { StorageAdapter } from "./storage";
import { KVStorageAdapter } from "./storage/kv-storage-adapter";
import { type ContextBindings, type CreateServerOptions } from "./types";

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
    prefixes,
    env: { database: dbEnvKey },
    storage,
  } = config;

  const app = new Hono<ContextBindings>().basePath(basePath);

  app.use(async (ctx, next) => {
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

  if (authOptions?.basic !== false) {
    app.use("*", basicMiddleware(authOptions?.basic));
  }

  if (authOptions?.apiKey !== false) {
    app.use("*", apiKeyMiddleware(authOptions?.apiKey));
  }

  if (authOptions?.jwt !== false) {
    app.use("*", jwtMiddleware(authOptions?.jwt));
  }

  app.route(prefixes.admin, adminRouter);
  app.route(prefixes.kv, kvRouter);
  app.route(prefixes.public, publicRouter);

  app.notFound((ctx) =>
    ctx.json(
      { success: false, status: 404, data: null, error: "Not found" },
      404
    )
  );

  app.onError((error, ctx) =>
    ctx.json(
      {
        success: false,
        status: 500,
        data: null,
        error: (error.cause as any)?.message ?? error.message,
      },
      500
    )
  );

  return app;
}
