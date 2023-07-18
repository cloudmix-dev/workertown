import { MemoryStorageAdapter as BaseMemoryStorageAdapter } from "@workertown/internal-storage/memory-storage-adapter";

export class MemoryStorageAdapter extends BaseMemoryStorageAdapter {
  private _valueStore = new Map<string, string>();

  constructor(initialDocuments: { key: string; value: unknown }[] = []) {
    super();

    initialDocuments.forEach((value) => {
      this._valueStore.set(value.key, JSON.stringify(value.value));
    });
  }

  public async getValue<T = unknown>(key: string): Promise<T | null> {
    const value = this._valueStore.get(key);

    if (typeof value === "undefined") {
      return null;
    }

    return JSON.parse(value) as T;
  }

  public async setValue<T = unknown>(key: string, value: T): Promise<T> {
    this._valueStore.set(key, JSON.stringify(value));

    return value;
  }

  public async deleteValue(key: string): Promise<void> {
    this._valueStore.delete(key);
  }
}
