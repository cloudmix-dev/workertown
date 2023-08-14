import { CacheAdapter } from "./cache-adapter.js";
import { Redis } from "@upstash/redis";

interface UpstashRedisCacheAdapterOptions {
  url: string;
  token: string;
  prefix?: string;
}

export class UpstashRedisCacheAdapter<T = unknown> extends CacheAdapter<T> {
  private readonly _client: Redis;

  public readonly prefix: string = "wt";

  constructor(options: UpstashRedisCacheAdapterOptions) {
    super();

    this._client = new Redis(options);
    this.prefix = options?.prefix ?? this.prefix;
  }

  private _prefixKey(key: string) {
    return `${this.prefix}_${key}`;
  }

  public async get(key: string) {
    const value = await this._client.get(this._prefixKey(key));

    if (!value) {
      return null;
    }

    return value as T;
  }

  public async set(key: string, value: unknown, ttl?: number) {
    await this._client.set(
      this._prefixKey(key),
      value,
      ttl ? { ex: ttl } : undefined,
    );
  }

  public async delete(key?: string): Promise<void> {
    if (key) {
      await this._client.del(this._prefixKey(key));
    } else {
      await this._client.flushdb();
    }
  }
}
