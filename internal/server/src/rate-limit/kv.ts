import { type KVNamespace } from "@cloudflare/workers-types";

import { RateLimiter } from "./rate-limiter.js";

interface KvRateLimiterOptions {
  limit: number;
  kv: KVNamespace;
  prefix?: string;
  window: number;
}

export class KvRateLimiter extends RateLimiter implements RateLimiter {
  private readonly _limit: number;

  private readonly _kv: KVNamespace;

  private readonly _prefix: string;

  private readonly _window: number;

  constructor(options: KvRateLimiterOptions) {
    super();

    this._limit = options.limit;
    this._kv = options.kv;
    this._prefix = options.prefix || "wt_rate_limit";
    this._window = options.window;
  }

  private _getKey(ip: string, timestamp = false) {
    return `${this._prefix}_${ip}${timestamp ? `_${Date.now()}` : ""}`;
  }

  async getRequestCount(ip: string) {
    const reqs = await this._kv.list({
      prefix: this._getKey(ip),
      limit: this._limit,
    });

    return reqs.keys.length;
  }

  async storeRequest(ip: string) {
    await this._kv.put(this._getKey(ip, true), ip, {
      expirationTtl: this._window,
    });
  }
}
