import { StorageAdapter } from "./storage-adapter.js";

export class MemoryStorageAdapter extends StorageAdapter {
  private _itemStore = new Map<string, string>();

  async getValue<T = any>(key: string): Promise<T | null> {
    const value = this._itemStore.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async setValue<T = any>(key: string, value: T): Promise<T> {
    this._itemStore.set(key, JSON.stringify(value));

    return value;
  }

  async deleteValue(key: string): Promise<void> {
    this._itemStore.delete(key);
  }
}
