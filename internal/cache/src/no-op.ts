import { CacheAdapter } from "./cache-adapter.js";

export class NoOpCacheAdapter<T = unknown> extends CacheAdapter<T> {
  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async get(key: string): Promise<T | null> {
    return null;
  }

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async set(key: string, value: unknown, ttl?: number): Promise<void> {}

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async delete(key?: string): Promise<void> {}
}
