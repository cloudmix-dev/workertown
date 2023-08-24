import { type KVNamespace } from "@cloudflare/workers-types";
import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { KvRateLimiter } from "../rate-limit/kv.js";
import { type RateLimiter } from "../rate-limit/rate-limiter.js";
import { type Middleware } from "../types.js";

interface RateLimitOptions {
  env: {
    kv: string;
  };
  limit: number;
  rateLimiter?: RateLimiter;
  window: number;
}

export type RateLimitOptionsOptional = DeepPartial<RateLimitOptions>;

const DEFAULT_OPTIONS: RateLimitOptions = {
  env: {
    kv: "RATE_LIMIT_KV",
  },
  limit: 10,
  window: 60,
};

export function rateLimit(options?: RateLimitOptionsOptional) {
  const {
    env,
    limit,
    rateLimiter: rateLimiterInstance,
    window: slidingWindow,
  } = merge({}, DEFAULT_OPTIONS, options);

  const handler: Middleware = async (ctx, next) => {
    const ip =
      ctx.req.headers.get("cf-connecting-ip") ??
      ctx.req.headers.get("x-forwarded-for") ??
      ctx.req.headers.get("x-real-ip") ??
      "0.0.0.0/0";
    const kv = ctx.env[env.kv] as KVNamespace;
    const rateLimiter =
      rateLimiterInstance ??
      new KvRateLimiter({ kv, limit, window: slidingWindow });
    const reqs = await rateLimiter.getRequestCount(ip);

    if (reqs >= limit) {
      return ctx.json(
        {
          success: false,
          status: 403,
          data: null,
          error: "Forbidden",
        },
        403,
        {
          "x-workertown-hint": "The origin IP has exceeded the rate limit",
        },
      );
    }

    await rateLimiter.storeRequest(ip);
    await next();
  };

  return handler;
}
