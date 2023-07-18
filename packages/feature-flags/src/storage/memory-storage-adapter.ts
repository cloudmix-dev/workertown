import { MemoryStorageAdapter as BaseMemoryStorageAdapter } from "@workertown/internal-storage/memory-storage-adapter";

import { type Flag } from "./storage-adapter.js";

export class MemoryStorageAdapter extends BaseMemoryStorageAdapter {
  private _flagStore = new Map<string, Flag>();

  constructor(initialFlags: Flag[] = []) {
    super();

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

  public async upsertFlag(
    flag: Pick<Flag, "name" | "description" | "enabled" | "conditions">,
  ): Promise<Flag> {
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
