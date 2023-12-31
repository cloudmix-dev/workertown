import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { type MiddlewareHandler } from "../router.js";
import { type User } from "../types.js";

interface ApiKeyOptions {
  apiKey?: string;
  env: {
    apiKey: string;
  };
  getCredentials: (req: Request) => string | null | undefined;
  verifyCredentials?: (apiKey: string) => boolean | Promise<boolean>;
}

export type ApiKeyOptionsOptional = DeepPartial<ApiKeyOptions>;

const DEFAULT_OPTIONS: ApiKeyOptions = {
  env: {
    apiKey: "AUTH_API_KEY",
  },
  getCredentials: (req) => {
    const authHeader = req.headers.get("Authorization");

    if (typeof authHeader === "string") {
      const [type, credentials] = authHeader.split(" ");

      if (type === "Bearer" && credentials) {
        return credentials;
      }
    }
  },
};

export function apiKey(options?: ApiKeyOptionsOptional) {
  const {
    apiKey: optionsApiKey,
    env: { apiKey: apiKeyEnvKey },
    getCredentials,
    verifyCredentials,
  } = merge({}, DEFAULT_OPTIONS, options);
  // biome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
  const handler: MiddlewareHandler<any> = async (ctx, next) => {
    const apiKey = (optionsApiKey ?? ctx.env?.[apiKeyEnvKey]) as string;
    const user: User | null = ctx.get("user") ?? null;

    if (user === null) {
      const credentials = getCredentials(ctx.req as unknown as Request);
      const allowed =
        typeof verifyCredentials === "function"
          ? await verifyCredentials(credentials ?? "")
          : credentials === apiKey;

      if (allowed) {
        ctx.set("user", { id: apiKey, strategy: "api_key" } as User);
      }
    }

    return next();
  };

  return handler;
}
