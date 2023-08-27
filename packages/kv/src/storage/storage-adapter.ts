import { StorageAdapter as BaseStorageAdapter } from "@workertown/internal-storage";

export class StorageAdapter extends BaseStorageAdapter {
  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  public async getValue<T = unknown>(key: string): Promise<T | null> {
    throw new Error("'getValue()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  public async setValue<T = unknown>(key: string, value: T): Promise<T> {
    throw new Error("'setValue()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  public async deleteValue(key: string): Promise<void> {
    throw new Error("'deleteValue()' not implemented");
  }
}
