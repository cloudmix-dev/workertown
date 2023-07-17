import { type KVNamespace } from "@cloudflare/workers-types";

import { CacheAdapter } from "./cache-adapter.js";

interface KVCacheAdapterOptions {
  prefix?: string;
}

export class KVCacheAdapter extends CacheAdapter {
  public readonly prefix: string = "wt_search_cache";

  public readonly kv: KVNamespace;

  constructor(kv: KVNamespace, options?: KVCacheAdapterOptions) {
    super();

    this.kv = kv;
    this.prefix = options?.prefix ?? this.prefix;
  }

  private _prefixKey(key: string) {
    return `${this.prefix}_${key}`;
  }

  public async get<T>(key: string) {
    const value = await this.kv.get(this._prefixKey(key), "json");

    if (value === null) {
      return null;
    }

    return value as T;
  }

  public async set(key: string, value: unknown) {
    await this.kv.put(this._prefixKey(key), JSON.stringify(value));
  }

  public async delete(key?: string) {
    let done = false;

    while (!done) {
      const { keys, list_complete: listComplete } = await this.kv.list({
        prefix: key ? this._prefixKey(key) : this.prefix,
      });

      for (const key of keys) {
        await this.kv.delete(key.name);
      }

      done = listComplete;
    }
  }
}
