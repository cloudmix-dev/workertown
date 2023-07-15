import { CacheAdapter } from "./cache-adapter.js";

export class NoOpCacheAdapter extends CacheAdapter {
  async get<T>(key: string): Promise<T | null> {
    return null;
  }

  async set(key: string, value: unknown): Promise<void> {}

  async delete(key?: string): Promise<void> {}
}
