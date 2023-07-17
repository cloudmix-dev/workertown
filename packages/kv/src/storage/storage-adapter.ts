import { StorageAdapter as BaseStorageAdapter } from "@workertown/internal-storage";

export class StorageAdapter extends BaseStorageAdapter {
  public async getValue<T = any>(key: string): Promise<T | null> {
    throw new Error("'getValue()' not implemented");
  }

  public async setValue<T = any>(key: string, value: T): Promise<T> {
    throw new Error("'setValue()' not implemented");
  }

  public async deleteValue(key: string): Promise<void> {
    throw new Error("'deleteValue()' not implemented");
  }
}
