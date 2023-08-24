import { type Message } from "@cloudflare/workers-types";
import { cors } from "hono/cors";

import {
  type ApiKeyOptions,
  type BasicOptions,
  type IpOptions,
  type JwtOptions,
  type LoggerFunc,
  type RateLimitOptions,
  type SentryOptions,
  apiKey as apiKeyMiddleware,
  basic as basicMiddleware,
  ip as ipMiddleware,
  jwt as jwtMiddleware,
  logger as loggerMiddleware,
  rateLimit as rateLimitMiddleware,
  sentry as sentryMiddleware,
} from "./middleware/index.js";
import { Server } from "./server.js";
import { type Context, User } from "./types.js";

export interface CreateServerOptions {
  access?: {
    ip?: IpOptions | false;
    rateLimit?: RateLimitOptions | false;
  };
  auth?: {
    basic?: BasicOptions | false;
    jwt?: JwtOptions | false;
    apiKey?: ApiKeyOptions | false;
    authenticateRequest?: (
      request: Request,
      user: User | null,
    ) =>
      | { id: string; [x: string]: unknown }
      | null
      | Promise<{ id: string; [y: string]: unknown } | null>;
  };
  basePath?: string;
  cors?: // Copy/pasted from cors/hono
    | {
        origin:
          | string
          | string[]
          | ((origin: string) => string | undefined | null);
        allowMethods?: string[];
        allowHeaders?: string[];
        maxAge?: number;
        credentials?: boolean;
        exposeHeaders?: string[];
      }
    | false;
  getEnv?: (env: Record<string, string>) => Record<string, string>;
  logger?: LoggerFunc | false;
  sentry?: SentryOptions | false;
}

export function createServer<
  T extends Context = Context,
  M extends Message = Message,
>(options: CreateServerOptions = {}): Server<T, M> {
  const {
    access: accessOptions,
    auth: authOptions,
    basePath = "/",
    cors: corsOptions,
    logger: loggerFunc,
    getEnv,
    sentry: sentryOptions,
  } = options;
  const server = new Server<T>().basePath(basePath);

  // This sets `ctx.env` to NodeJS's `process.env` if we're an environment that
  // supports it, or an optionally provided `getEnv` function.
  server.use(async (ctx, next) => {
    if (typeof getEnv === "function") {
      ctx.env = getEnv((ctx.env as Record<string, string>) ?? {});
    } else if (!ctx.env && globalThis.process?.env) {
      ctx.env = globalThis.process.env;
    }

    await next();
  });

  if (accessOptions?.ip) {
    server.use("*", ipMiddleware(accessOptions?.ip));
  }

  if (accessOptions?.rateLimit) {
    server.use("*", rateLimitMiddleware(accessOptions?.rateLimit));
  }

  if (loggerFunc !== false) {
    server.use("*", loggerMiddleware(loggerFunc));
  }

  if (sentryOptions) {
    server.use("*", sentryMiddleware(sentryOptions));
  }

  if (authOptions?.basic !== false) {
    server.use("*", basicMiddleware(authOptions?.basic));
  }

  if (authOptions?.apiKey !== false) {
    server.use("*", apiKeyMiddleware(authOptions?.apiKey));
  }

  if (authOptions?.jwt !== false) {
    server.use("*", jwtMiddleware(authOptions?.jwt));
  }

  if (typeof authOptions?.authenticateRequest === "function") {
    server.use("*", async (ctx, next) => {
      const user = await authOptions.authenticateRequest?.(
        ctx.req as unknown as Request,
        // rome-ignore lint/suspicious/noExplicitAny: We know `user` will exist within the context here
        (ctx as any).get("user") ?? null,
      );

      if (!user?.id) {
        return ctx.json(
          {
            success: false,
            status: 401,
            data: null,
            error: "Unauthorized",
          },
          401,
          {
            "x-workertown-hint":
              "The user is not authorized to access this resource",
          },
        );
      }

      // rome-ignore lint/suspicious/noExplicitAny: We know `user` will exist within the context here
      (ctx as any).set("user", user);

      return next();
    });
  }

  if (corsOptions) {
    server.use("*", cors(corsOptions));
    server.options("*", (ctx) => ctx.text("OK"));
  }

  server.notFound((ctx) =>
    ctx.json(
      { success: false, status: 404, data: null, error: "Not found" },
      404,
      { "x-workertown-hint": "The requested resource was not found" },
    ),
  );

  server.onError((error, ctx) => {
    console.error(error);

    return ctx.json(
      {
        success: false,
        status: 500,
        data: null,
        // rome-ignore lint/suspicious/noExplicitAny: We need to reach inside of the Error
        error: (error.cause as any)?.message ?? error.message,
      },
      500,
      {
        "x-workertown-hint":
          "An unexpected error occurred while processing the request",
      },
    );
  });

  return server;
}
