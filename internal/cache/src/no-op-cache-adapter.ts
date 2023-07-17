import { CacheAdapter } from "./cache-adapter.js";

export class NoOpCacheAdapter extends CacheAdapter {
  public async get<T>(key: string): Promise<T | null> {
    return null;
  }

  public async set(key: string, value: unknown): Promise<void> {}

  public async delete(key?: string): Promise<void> {}
}
