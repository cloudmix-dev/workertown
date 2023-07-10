import { type D1Database } from "@cloudflare/workers-types";
import { type DeepPartial } from "@workertown/internal-types";
import {
  apiKey as apiKeyMiddleware,
  basic as basicMiddleware,
  jwt as jwtMiddleware,
} from "@workertown/middleware";
import { Hono } from "hono";
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

function createRoute(basePath: string, route: string) {
  const prefix = basePath.startsWith("/") ? "" : "/";
  const formattedBasePath = basePath.endsWith("/") ? basePath : `${basePath}/`;
  const formattedRoute = route.startsWith("/") ? route.slice(1) : route;

  return `${prefix}${formattedBasePath}${formattedRoute}`;
}

export function createSearchServer(options?: CreateServerOptionsOptional) {
  const config = merge(DEFAULT_OPTIONS, options);
  const {
    auth: authOptions,
    basePath,
    prefixes,
    env: { database: dbEnvKey },
    storage,
  } = config;

  const app = new Hono<ContextBindings>();

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

  if (authOptions?.basic !== false) {
    app.use("*", basicMiddleware(authOptions?.basic));
  }

  if (authOptions?.apiKey !== false) {
    app.use("*", apiKeyMiddleware(authOptions?.apiKey));
  }

  if (authOptions?.jwt !== false) {
    app.use("*", jwtMiddleware(authOptions?.jwt));
  }

  app.route(createRoute(basePath, prefixes.admin), adminRouter);
  app.route(createRoute(basePath, prefixes.public), publicRouter);
  app.route(createRoute(basePath, prefixes.ask), askRouter);
  app.route(createRoute(basePath, prefixes.flags), flagsRouter);

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
