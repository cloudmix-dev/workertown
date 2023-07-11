import {
  type ExecutionContext,
  type MessageBatch,
  type ScheduledEvent,
} from "@cloudflare/workers-types";
import {
  type ApiKeyOptions,
  type BasicOptions,
  type JwtOptions,
  apiKey as apiKeyMiddleware,
  basic as basicMiddleware,
  jwt as jwtMiddleware,
} from "@workertown/middleware";
import { type Env, Hono } from "hono";

type WorkertownHono<T extends Env> = Hono<T> & {
  queue?: (
    messages: MessageBatch<any>,
    env: Env["Bindings"],
    ctx: ExecutionContext
  ) => void | Promise<void>;
  scheduled?: (
    event: ScheduledEvent,
    env: Env["Bindings"],
    ctx: ExecutionContext
  ) => void | Promise<void>;
};

export interface CreateServerOptions {
  auth?: {
    basic?: BasicOptions | false;
    jwt?: JwtOptions | false;
    apiKey?: ApiKeyOptions | false;
  };
  basePath?: string;
}

export function createServer<T extends Env>(options: CreateServerOptions = {}) {
  const { basePath = "/", auth: authOptions } = options;
  const server = new Hono<T>().basePath(basePath) as WorkertownHono<T>;

  // This sets `ctx.env` to NodeJS' `process.env` if we're in that environment
  server.use(async (ctx, next) => {
    if (!ctx.env && globalThis.process.env) {
      ctx.env = globalThis.process.env;
    }

    return next();
  });

  if (authOptions?.basic !== false) {
    server.use("*", basicMiddleware(authOptions?.basic));
  }

  if (authOptions?.apiKey !== false) {
    server.use("*", apiKeyMiddleware(authOptions?.apiKey));
  }

  if (authOptions?.jwt !== false) {
    server.use("*", jwtMiddleware(authOptions?.jwt));
  }

  server.notFound((ctx) =>
    ctx.json(
      { success: false, status: 404, data: null, error: "Not found" },
      404
    )
  );

  server.onError((error, ctx) =>
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

  return server as WorkertownHono<T>;
}
