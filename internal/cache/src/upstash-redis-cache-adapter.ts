import { CacheAdapter } from "./cache-adapter.js";
import { Redis } from "@upstash/redis";

interface UpstashRedisCacheAdapterOptions {
  url: string;
  token: string;
}

export class UpstashRedisCacheAdapter extends CacheAdapter {
  private _client: Redis;

  constructor(options: UpstashRedisCacheAdapterOptions) {
    super();

    this._client = new Redis(options);
  }

  public async get<T>(key: string) {
    const value = await this._client.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value as string) as T;
  }

  public async set(key: string, value: unknown, ttl?: number) {
    await this._client.set(key, JSON.stringify(value), { ex: ttl ?? 0 });
  }

  public async delete(key?: string): Promise<void> {
    if (key) {
      await this._client.del(key);
    } else {
      await this._client.flushdb();
    }
  }
}
