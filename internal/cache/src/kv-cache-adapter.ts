import { type KVNamespace } from "@cloudflare/workers-types";

import { CacheAdapter } from "./cache-adapter.js";

interface KVCacheAdapterOptions {
  prefix?: string;
}

export class KVCacheAdapter extends CacheAdapter {
  public readonly _prefix: string = "wt_search_cache";

  public readonly _kv: KVNamespace;

  constructor(kv: KVNamespace, options?: KVCacheAdapterOptions) {
    super();

    this._kv = kv;
    this._prefix = options?.prefix ?? this._prefix;
  }

  private _prefixKey(key: string) {
    return `${this._prefix}_${key}`;
  }

  public async get<T>(key: string) {
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
        prefix: key ? this._prefixKey(key) : this._prefix,
      });

      for (const key of keys) {
        await this._kv.delete(key.name);
      }

      done = listComplete;
    }
  }
}
