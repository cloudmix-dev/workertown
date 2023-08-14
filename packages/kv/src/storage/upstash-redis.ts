import { Redis } from "@upstash/redis";

import { StorageAdapter } from "./storage-adapter.js";

interface UpstashRedisStorageAdapterOptions {
  url: string;
  token: string;
}

export class UpstashRedisStorageAdapter extends StorageAdapter {
  private readonly _client: Redis;

  constructor(options: UpstashRedisStorageAdapterOptions) {
    super();

    this._client = new Redis(options);
  }

  private _formatKey(key: string) {
    return `kv_${key.replaceAll(/\//g, "_")}`;
  }

  public async getValue<T = unknown>(key: string) {
    const value = await this._client.get<string>(this._formatKey(key));

    return value ? (JSON.parse(value) as T) : null;
  }

  public async setValue<T = unknown>(key: string, value: T) {
    await this._client.set(this._formatKey(key), JSON.stringify(value));

    return value;
  }

  public async deleteValue(key: string) {
    await this._client.del(this._formatKey(key));
  }
}
