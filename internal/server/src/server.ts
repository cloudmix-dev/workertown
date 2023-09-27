import {
  type ExportedHandlerQueueHandler,
  type ExportedHandlerScheduledHandler,
  type Message,
} from "@cloudflare/workers-types";
import { type Context as HonoContext, Hono, type Next } from "hono";
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
import { type MiddlewareHandler, Router } from "./router.js";
import { User } from "./types.js";

export interface ServerOptions {
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
      | Promise<{ id: string; [x: string]: unknown } | null>;
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

export class Server<
  E extends Record<string, unknown> = Record<string, unknown>,
  M extends Message = Message,
> {
  private readonly _server: Hono<{
    Bindings: { [x: string]: unknown };
    Variables: E;
  }> = new Hono();

  constructor(options: ServerOptions = {}) {
    if (options.basePath) {
      this._server = this._server.basePath(options.basePath);
    }

    this.fetch = this.fetch.bind(this);
    this.request = this.request.bind(this);
    this.use = this.use.bind(this);
    this.route = this.route.bind(this);
    this.asRouter = this.asRouter.bind(this);

    this._init(options);
  }

  get server() {
    return this._server;
  }

  private _init(options: ServerOptions) {
    // This sets `ctx.env` to NodeJS's `process.env` if we're an environment that
    // supports it, or an optionally provided `getEnv` function.
    this._server.use(async (ctx, next) => {
      if (typeof options.getEnv === "function") {
        ctx.env = options.getEnv((ctx.env as Record<string, string>) ?? {});
      } else if (!ctx.env && globalThis.process?.env) {
        ctx.env = globalThis.process.env;
      }

      await next();
    });

    // biome-ignore lint/suspicious/noExplicitAny: The middlewares have a different context requirement
    const middlewares: MiddlewareHandler<any>[] = [];

    if (options.cors) {
      middlewares.push(cors(options.cors));
      this._server.options("*", (ctx) => ctx.text("OK"));
    }

    if (options.access?.ip) {
      middlewares.push(ipMiddleware(options.access?.ip));
    }

    if (options.access?.rateLimit) {
      middlewares.push(rateLimitMiddleware(options.access?.rateLimit));
    }

    if (options.logger !== false) {
      middlewares.push(loggerMiddleware(options.logger));
    }

    if (options.sentry) {
      middlewares.push(sentryMiddleware(options.sentry));
    }

    if (options.auth?.basic !== false) {
      middlewares.push(basicMiddleware(options.auth?.basic));
    }

    if (options.auth?.apiKey !== false) {
      middlewares.push(apiKeyMiddleware(options.auth?.apiKey));
    }

    if (options.auth?.jwt !== false) {
      middlewares.push(jwtMiddleware(options.auth?.jwt));
    }

    if (typeof options.auth?.authenticateRequest === "function") {
      middlewares.push(async (ctx: HonoContext, next: Next) => {
        const user = await options.auth?.authenticateRequest?.(
          ctx.req as unknown as Request,
          ctx.get("user") ?? null,
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
              "X-Workertown-Hint":
                "The user is not authorized to access this resource",
            },
          );
        }

        ctx.set("user", user);

        return next();
      });
    }

    this._server.use("*", ...middlewares);

    this._server.notFound((ctx) =>
      ctx.json(
        { success: false, status: 404, data: null, error: "Not found" },
        404,
        { "X-Workertown-Hint": "The requested resource was not found" },
      ),
    );

    this._server.onError((error, ctx) => {
      console.error(error);

      return ctx.json(
        {
          success: false,
          status: 500,
          data: null,
          // biome-ignore lint/suspicious/noExplicitAny: We need to reach inside of the Error
          error: (error.cause as any)?.message ?? error.message,
        },
        500,
        {
          "X-Workertown-Hint":
            "An unexpected error occurred while processing the request",
        },
      );
    });
  }

  // biome-ignore lint/suspicious/noExplicitAny: The other arguments could be of *any* type
  fetch(request: Request, ...args: any[]) {
    return this._server.fetch(request, ...args);
  }

  request(input: string | Request | URL, requestInit?: RequestInit) {
    return this._server.request(input, requestInit);
  }

  use(path: string, ...handlers: MiddlewareHandler<E>[]) {
    this._server.use(path, ...handlers);

    return this;
  }

  route(path: string, router: Router<E>) {
    this._server.route(path, router.router);

    return this;
  }

  asRouter() {
    return new Router<E>({ hono: this._server });
  }

  queue?: ExportedHandlerQueueHandler<{ [x: string]: unknown }, M>;

  scheduled?: ExportedHandlerScheduledHandler<{ [x: string]: unknown }>;
}

export function createServer<
  E extends Record<string, unknown> = Record<string, unknown>,
  M extends Message = Message,
>(options: ServerOptions = {}) {
  return new Server<E, M>(options);
}
