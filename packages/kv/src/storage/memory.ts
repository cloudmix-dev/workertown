import { MemoryStorageAdapter as BaseMemoryStorageAdapter } from "@workertown/internal-storage/memory";

import { type StorageAdapter } from "./storage-adapter.js";
interface MemoryStorageAdapterOptions {
  initialValues?: Record<string, unknown>;
}

export class MemoryStorageAdapter
  extends BaseMemoryStorageAdapter
  implements StorageAdapter
{
  private readonly _valueStore = new Map<string, string>();

  constructor(options: MemoryStorageAdapterOptions = {}) {
    super();

    const { initialValues = {} } = options;

    for (const key of Object.keys(initialValues)) {
      this._valueStore.set(key, JSON.stringify(initialValues[key]));
    }
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
