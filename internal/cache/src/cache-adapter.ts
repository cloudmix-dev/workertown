export class CacheAdapter<T = unknown> {
  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async get(key: string): Promise<T | null> {
    throw new TypeError("'get()' not implemented");
  }

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async set(key: string, value: T, ttl?: number): Promise<void> {
    throw new TypeError("'set()' not implemented");
  }

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async delete(key?: string): Promise<void> {
    throw new TypeError("'clear()' not implemented");
  }
}
