import {
  type ExportedHandlerQueueHandler,
  type ExportedHandlerScheduledHandler,
} from "@cloudflare/workers-types";
import { type QueueMessage } from "@workertown/internal-queue";
import { Hono, type HonoRequest, type Input } from "hono";
import { cors } from "hono/cors";

import {
  type ApiKeyOptions,
  type BasicOptions,
  type IpOptions,
  type JwtOptions,
  type RateLimitOptions,
  type SentryOptions,
  apiKey as apiKeyMiddleware,
  basic as basicMiddleware,
  ip as ipMiddleware,
  jwt as jwtMiddleware,
  rateLimit as rateLimitMiddleware,
  sentry as sentryMiddleware,
} from "./middleware/index.js";
import { type Context, User } from "./types.js";

export class WorkertownHono<T extends Context> extends Hono<T> {
  queue?: ExportedHandlerQueueHandler<T["Variables"], QueueMessage>;
  scheduled?: ExportedHandlerScheduledHandler;
}

export type WorkertownRequest<
  P extends string = "/",
  I extends Input["out"] = {},
> = HonoRequest<P, I>;

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
      request: WorkertownRequest,
      user: User | null,
    ) => boolean | Promise<boolean>;
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
  sentry?: SentryOptions | false;
}

export function createServer<T extends Context>(
  options: CreateServerOptions = {},
) {
  const {
    access: accessOptions,
    auth: authOptions,
    basePath = "/",
    cors: corsOptions,
    sentry: sentryOptions,
  } = options;
  const server = new Hono<T>().basePath(basePath) as WorkertownHono<T>;

  // This sets `ctx.env` to NodeJS' `process.env` if we're in that environment
  server.use(async (ctx, next) => {
    if (!ctx.env && globalThis.process?.env) {
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
      const allowed = await authOptions.authenticateRequest?.(
        ctx.req as unknown as HonoRequest,
        // rome-ignore lint/suspicious/noExplicitAny: We know `user` will exist within the context here
        (ctx as any).get("user") ?? null,
      );

      if (!allowed) {
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

  return server as WorkertownHono<T>;
}
