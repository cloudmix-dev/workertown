import { type DeepPartial } from "@workertown/internal-types";
import { type MiddlewareHandler } from "hono";
import merge from "lodash.merge";

interface ApiKeyOptions {
  apiKey?: string;
  env: {
    apiKey: string;
  };
}

export type ApiKeyOptionsOptional = DeepPartial<ApiKeyOptions>;

const DEFAULT_OPTIONS: ApiKeyOptions = {
  env: {
    apiKey: "AUTH_API_KEY",
  },
};

export function apiKey(options?: ApiKeyOptionsOptional) {
  const {
    apiKey: optionsApiKey,
    env: { apiKey: apiKeyEnvKey },
  } = merge({}, DEFAULT_OPTIONS, options);
  const handler: MiddlewareHandler = (ctx, next) => {
    const apiKey = (optionsApiKey ?? ctx.env?.[apiKeyEnvKey]) as string;
    const user = ctx.get("user") ?? null;

    if (user === null && apiKey) {
      const authHeader = ctx.req.headers.get("Authorization");

      if (typeof authHeader === "string") {
        const [type, credentials] = authHeader.split(" ");

        if (type === "Bearer" && credentials === apiKey) {
          ctx.set("user", { id: "api_key" });
        }
      }
    }

    return next();
  };

  return handler;
}
