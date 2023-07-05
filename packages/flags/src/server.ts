import { type KVNamespace } from "@cloudflare/workers-types";
import { type DeepPartial } from "@workertown/internal-types";
import {
  type ApiKeyOptions,
  type BasicOptions,
  type JwtOptions,
  apiKey as apiKeyMiddleware,
  authenticated as authMiddleware,
  basic as basicMiddleware,
  jwt as jwtMiddleware,
} from "@workertown/middleware";
import { Hono, type MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import merge from "lodash.merge";

import * as endpoints from "./endpoints";
import { type Context } from "./types";

interface CreateServerOptions {
  auth?: {
    basic?: BasicOptions | false;
    jwt?: JwtOptions | false;
    apiKey?: ApiKeyOptions | false;
  };
  endpoints: {
    ask: string;
    createFlag: string;
    deleteFlag: string;
    getFlag: string;
    getFlags: string;
    openApi: string;
  };
  env: {
    kv: string;
  };
}

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
        cache: "FLAGS_JWKS_CACHE",
        audience: "FLAGS_JWT_AUDIENCE",
        issuer: "FLAGS_JWT_ISSUER",
      },
    },
  },
  endpoints: {
    ask: "/v1/ask",
    createFlag: "/v1/flags/:flag",
    deleteFlag: "/v1/flags/:flag",
    getFlag: "/v1/flags/:flag",
    getFlags: "/v1/flags",
    openApi: "/v1/openapi.json",
  },
  env: {
    kv: "FLAGS_KV",
  },
};

export function createFlagsServer(options?: CreateServerOptionsOptional) {
  const {
    auth: authOptions,
    env: { kv: kvEnvKey },
    endpoints: {
      ask: askEndpoint,
      createFlag: createFlagEndpoint,
      deleteFlag: deleteFlagEndpoint,
      getFlag: getFlagEndpoint,
      getFlags: getFlagsEndpoint,
      openApi: openApiEndpoint,
    },
  } = merge(DEFAULT_OPTIONS, options);

  // Validate endpoints
  [getFlagEndpoint, createFlagEndpoint, deleteFlagEndpoint].forEach(
    (endpoint) => {
      if (!endpoint.includes(":flag")) {
        throw new Error(
          `Invalid endpoint ${endpoint} - must include :flag parameter`
        );
      }
    }
  );

  const app = new Hono();
  const buildContext: MiddlewareHandler = async (ctx: Context, next) => {
    const kv = ctx.env[kvEnvKey] as KVNamespace | undefined;

    if (!kv) {
      throw new HTTPException(500, {
        message: `KV not found at env.${kvEnvKey}`,
      });
    }

    ctx.set("kv", kv);

    return next();
  };
  const authMiddlewareHandlers: any[] = [];

  if (authOptions?.basic !== false) {
    authMiddlewareHandlers.push(basicMiddleware(authOptions?.basic));
  }

  if (authOptions?.apiKey !== false) {
    authMiddlewareHandlers.push(apiKeyMiddleware(authOptions?.apiKey));
  }

  if (authOptions?.jwt !== false) {
    authMiddlewareHandlers.push(jwtMiddleware(authOptions?.jwt));
  }

  authMiddlewareHandlers.push(authMiddleware());

  app.get(openApiEndpoint, endpoints.openApiSpec);

  app.get(
    getFlagsEndpoint,
    buildContext,
    ...authMiddlewareHandlers,
    endpoints.getFlags
  );

  app.get(
    getFlagEndpoint,
    buildContext,
    ...authMiddlewareHandlers,
    endpoints.getFlag
  );
  app.put(
    createFlagEndpoint,
    buildContext,
    ...authMiddlewareHandlers,
    endpoints.createFlag
  );
  app.delete(
    deleteFlagEndpoint,
    buildContext,
    ...authMiddlewareHandlers,
    endpoints.deleteFlag
  );

  app.post(askEndpoint, buildContext, ...authMiddlewareHandlers, endpoints.ask);

  return app;
}
