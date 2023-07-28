import { MemoryStorageAdapter as BaseMemoryStorageAdapter } from "@workertown/internal-storage/memory";

import {
  type Flag,
  StorageAdapter,
  type UpsertFlagBody,
} from "./storage-adapter.js";

interface MemoryStorageAdapterOptions {
  initialFlags?: Flag[];
}

export class MemoryStorageAdapter
  extends BaseMemoryStorageAdapter
  implements StorageAdapter
{
  private readonly _flagStore = new Map<string, Flag>();

  constructor(options: MemoryStorageAdapterOptions = {}) {
    super();

    const { initialFlags = [] } = options;

    initialFlags.forEach((flag) => {
      this._flagStore.set(flag.name, flag);
    });
  }

  public async getFlags(disabled = false): Promise<Flag[]> {
    return Array.from(this._flagStore.values())
      .filter((flag) => {
        if (disabled === false && !flag.enabled) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  public async getFlag(name: string): Promise<Flag | null> {
    return this._flagStore.get(name) ?? null;
  }

  public async upsertFlag(flag: UpsertFlagBody): Promise<Flag> {
    const existing = await this.getFlag(flag.name);

    if (existing) {
      const flagRecord = {
        ...existing,
        ...flag,
        updatedAt: new Date(),
      };

      this._flagStore.set(flag.name, flagRecord);

      return flagRecord;
    } else {
      const flagRecord = {
        ...flag,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this._flagStore.set(flag.name, flagRecord);

      return flagRecord;
    }
  }

  public async deleteFlag(name: string): Promise<void> {
    this._flagStore.delete(name);
  }
}
