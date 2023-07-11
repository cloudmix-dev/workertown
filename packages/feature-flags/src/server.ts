import { type D1Database } from "@cloudflare/workers-types";
import { createServer } from "@workertown/hono";
import { type DeepPartial } from "@workertown/internal-types";
import { HTTPException } from "hono/http-exception";
import merge from "lodash.merge";

import { adminRouter, askRouter, flagsRouter, publicRouter } from "./routers";
import { StorageAdapter } from "./storage";
import { D1StorageAdapter } from "./storage/d1-storage-adapter";
import { type ContextBindings, type CreateServerOptions } from "./types";

type CreateServerOptionsOptional = DeepPartial<CreateServerOptions>;

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
  basePath: "/",
  env: {
    database: "FLAGS_DB",
  },
  prefixes: {
    admin: "/v1/admin",
    ask: "/v1/ask",
    flags: "/v1/flags",
    public: "/",
  },
};

export function createFeatureFlagsServer(
  options?: CreateServerOptionsOptional
) {
  const config = merge(DEFAULT_OPTIONS, options);
  const {
    auth: authOptions,
    basePath,
    prefixes,
    env: { database: dbEnvKey },
    storage,
  } = config;

  const app = createServer<ContextBindings>({ basePath, auth: authOptions });

  app.use(async (ctx, next) => {
    let storageAdapter: StorageAdapter | undefined = storage;

    if (!storageAdapter) {
      const db = ctx.env[dbEnvKey] as D1Database | undefined;

      if (!db) {
        throw new HTTPException(500, {
          message: `Database not found at env.${dbEnvKey}`,
        });
      }

      storageAdapter = new D1StorageAdapter({ db });
    }

    ctx.set("config", config);
    ctx.set("storage", storageAdapter);

    return next();
  });

  app.route(prefixes.admin, adminRouter);
  app.route(prefixes.ask, askRouter);
  app.route(prefixes.flags, flagsRouter);
  app.route(prefixes.public, publicRouter);

  return app;
}
