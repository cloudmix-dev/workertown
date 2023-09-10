import { CacheAdapter } from "./cache-adapter.js";

export class NoOpCacheAdapter<T = unknown> extends CacheAdapter<T> {
  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async get(key: string): Promise<T | null> {
    return null;
  }

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async set(key: string, value: unknown, ttl?: number): Promise<void> {}

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async delete(key?: string): Promise<void> {}
}
