export class CacheAdapter {
  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async get<T>(key: string): Promise<T | null> {
    throw new TypeError("'get()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async set(key: string, value: unknown, ttl?: number): Promise<void> {
    throw new TypeError("'set()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async delete(key?: string): Promise<void> {
    throw new TypeError("'clear()' not implemented");
  }
}
