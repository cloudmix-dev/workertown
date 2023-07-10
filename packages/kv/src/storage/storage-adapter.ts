export class StorageAdapter {
  async getValue<T = any>(key: string): Promise<T | null> {
    throw new Error("'getValue()' not implemented");
  }

  async setValue<T = any>(key: string, value: T): Promise<T> {
    throw new Error("'setValue()' not implemented");
  }

  async deleteValue(key: string): Promise<void> {
    throw new Error("'deleteValue()' not implemented");
  }

  async runMigrations(): Promise<void> {}
}
