import { type D1Database } from "@cloudflare/workers-types";
import { createServer } from "@workertown/internal-hono";
import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { v1 } from "./routers/index.js";
import { D1StorageAdapter } from "./storage/d1-storage-adapter.js";
import { StorageAdapter } from "./storage/index.js";
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
  basePath: "/",
  cors: false,
  endpoints: {
    v1: {
      admin: "/v1/admin",
      ask: "/v1/ask",
      flags: "/v1/flags",
      public: "/",
    },
  },
  env: {
    database: "FLAGS_DB",
  },
};

export function createFeatureFlagsServer(
  options?: CreateServerOptionsOptional
) {
  const config = merge(DEFAULT_OPTIONS, options);
  const {
    auth: authOptions,
    basePath,
    cors,
    endpoints,
    env: { database: dbEnvKey },
    storage,
  } = config;

  const server = createServer<Context>({ auth: authOptions, basePath, cors });

  server.use(async (ctx, next) => {
    let storageAdapter: StorageAdapter | undefined = storage;

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

    ctx.set("config", config);
    ctx.set("storage", storageAdapter);

    return next();
  });

  server.route(endpoints.v1.admin, v1.adminRouter);
  server.route(endpoints.v1.ask, v1.askRouter);
  server.route(endpoints.v1.flags, v1.flagsRouter);
  server.route(endpoints.v1.public, v1.publicRouter);

  return server;
}
