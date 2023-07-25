import { MemoryStorageAdapter as BaseMemoryStorageAdapter } from "@workertown/internal-storage/memory-storage-adapter";

interface MemoryStorageAdapterOptions {
  initialValues?: Record<string, unknown>;
}

export class MemoryStorageAdapter extends BaseMemoryStorageAdapter {
  private readonly _valueStore = new Map<string, string>();

  constructor(options: MemoryStorageAdapterOptions = {}) {
    super();

    const { initialValues = {} } = options;

    Object.entries(initialValues).forEach(([key, value]) => {
      this._valueStore.set(key, JSON.stringify(value));
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
