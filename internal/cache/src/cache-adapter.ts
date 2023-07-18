export class CacheAdapter {
  public async get<T>(key: string): Promise<T | null> {
    throw new TypeError("'get()' not implemented");
  }

  public async set(key: string, value: unknown, ttl?: number): Promise<void> {
    throw new TypeError("'set()' not implemented");
  }

  public async delete(key?: string): Promise<void> {
    throw new TypeError("'clear()' not implemented");
  }
}
