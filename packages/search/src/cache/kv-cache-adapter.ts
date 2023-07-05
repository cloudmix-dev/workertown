import { type KVNamespace } from "@cloudflare/workers-types";

import { CacheAdapter } from "./cache-adapter";

interface KVCacheAdapterOptions {
  prefix?: string;
}

export class KVCacheAdapter extends CacheAdapter {
  private _prefix = "wt_search_cache";

  private _kv: KVNamespace;

  constructor(kv: KVNamespace, options?: KVCacheAdapterOptions) {
    super();

    this._kv = kv;
    this._prefix = options?.prefix ?? this._prefix;
  }

  private _prefixKey(key: string) {
    return `${this._prefix}_${key}`;
  }

  async get<T>(key: string) {
    const value = await this._kv.get(this._prefixKey(key), "json");

    if (value === null) {
      return null;
    }

    return value as T;
  }

  async set(key: string, value: unknown) {
    await this._kv.put(this._prefixKey(key), JSON.stringify(value));
  }

  async delete(key: string) {
    await this._kv.delete(this._prefixKey(key));
  }

  async clear() {
    let done = false;

    while (!done) {
      const { keys, list_complete: listComplete } = await this._kv.list({
        prefix: this._prefix,
      });

      for (const key of keys) {
        await this._kv.delete(key.name);
      }

      done = listComplete;
    }
  }
}
