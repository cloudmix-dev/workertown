import { CacheAdapter } from "./cache-adapter.js";

export class MemoryCacheAdapter<T = unknown> extends CacheAdapter<T> {
  private readonly _cache = new Map<string, unknown>();

  public readonly prefix: string = "wt";

  private _prefixKey(key: string) {
    return `${this.prefix}_${key}`;
  }

  public async get(key: string): Promise<T | null> {
    const value = this._cache.get(this._prefixKey(key));

    if (!value) {
      return null;
    }

    return JSON.parse(value as string) as T;
  }

  public async set(key: string, value: unknown, ttl?: number): Promise<void> {
    this._cache.set(this._prefixKey(key), JSON.stringify(value));

    if (typeof ttl === "number") {
      setTimeout(() => {
        this._cache.delete(this._prefixKey(key));
      }, ttl * 1000);
    }
  }

  public async delete(key?: string): Promise<void> {
    if (key) {
      this._cache.delete(this._prefixKey(key));
    } else {
      this._cache.clear();
    }
  }
}
