import { CacheAdapter } from "./cache-adapter";

export class MemoryCacheAdapter extends CacheAdapter {
  private _cache = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    return (this._cache.get(key) as T) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    this._cache.set(key, value);
  }

  async delete(key?: string): Promise<void> {
    if (key) {
      this._cache.delete(key);
    } else {
      this._cache.clear();
    }
  }
}
