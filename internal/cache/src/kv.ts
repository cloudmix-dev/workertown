import { type KVNamespace } from "@cloudflare/workers-types";

import { CacheAdapter } from "./cache-adapter.js";

interface KVCacheAdapterOptions {
  kv: KVNamespace;
  prefix?: string;
}

export class KVCacheAdapter<T = unknown> extends CacheAdapter<T> {
  private readonly _kv: KVNamespace;

  public readonly prefix: string = "wt";

  constructor(options: KVCacheAdapterOptions) {
    super();

    this._kv = options.kv;
    this.prefix = options?.prefix ?? this.prefix;
  }

  private _prefixKey(key: string) {
    return `${this.prefix}_${key}`;
  }

  public async get(key: string) {
    const value = await this._kv.get(this._prefixKey(key), "json");

    if (value === null) {
      return null;
    }

    return value as T;
  }

  public async set(key: string, value: unknown, ttl?: number) {
    await this._kv.put(this._prefixKey(key), JSON.stringify(value), {
      expirationTtl: ttl,
    });
  }

  public async delete(key?: string) {
    let done = false;

    while (!done) {
      const { keys, list_complete: listComplete } = await this._kv.list({
        prefix: key ? this._prefixKey(key) : this.prefix,
      });

      for (const key of keys) {
        await this._kv.delete(key.name);
      }

      done = listComplete;
    }
  }
}
