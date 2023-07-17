import { MemoryStorageAdapter as BaseMemoryStorageAdapter } from "@workertown/internal-storage/memory-storage-adapter";

export class MemoryStorageAdapter extends BaseMemoryStorageAdapter {
  private _itemStore = new Map<string, string>();

  public async getValue<T = any>(key: string): Promise<T | null> {
    const value = this._itemStore.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  public async setValue<T = any>(key: string, value: T): Promise<T> {
    this._itemStore.set(key, JSON.stringify(value));

    return value;
  }

  public async deleteValue(key: string): Promise<void> {
    this._itemStore.delete(key);
  }
}
