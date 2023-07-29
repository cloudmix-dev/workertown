import { Redis } from "@upstash/redis";

import { RateLimiter } from "./rate-limiter.js";

interface UpstashRedisRateLimiterOptions {
  limit: number;
  prefix?: string;
  token: string;
  url: string;
  window: number;
}

export class UpstashRedisRateLimiter extends RateLimiter implements RateLimiter {
  private readonly _limit: number;

  private readonly _prefix: string;

  private readonly _redis: Redis;

  private readonly _window: number;

  constructor(options: UpstashRedisRateLimiterOptions) {
    super();

    this._redis = new Redis({
      url: options.url,
      token: options.token,
    });
    this._prefix = options.prefix || "wt_rate_limit";
    this._limit = options.limit;
    this._window = options.window * 1000;
  }

  private _getKey(ip: string, timestamp = false) {
    return `${this._prefix}_${ip}${timestamp ? `_${Date.now()}` : ""}`;
  }

  async getRequestCount(ip: string) {
    const reqs = await this._redis.scan(0, {
      match: this._getKey(ip),
      count: this._limit,
    });

    return reqs[1].length;
  }

  async storeRequest(ip: string) {
    await this._redis.set(this._getKey(ip, true), ip, { ex: this._window });
  }
}
