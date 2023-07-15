export class CacheAdapter {
  async get<T>(key: string): Promise<T | null> {
    throw new TypeError("'get()' not implemented");
  }

  async set(key: string, value: unknown): Promise<void> {
    throw new TypeError("'set()' not implemented");
  }

  async delete(key?: string): Promise<void> {
    throw new TypeError("'clear()' not implemented");
  }
}
