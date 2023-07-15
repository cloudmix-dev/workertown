import { type Flag, StorageAdapter } from "./storage-adapter";

export class MemoryStorageAdapter extends StorageAdapter {
  private _itemStore = new Map<string, Flag>();

  async getFlags(disabled?: boolean): Promise<Flag[]> {
    return Array.from(this._itemStore.values()).filter((item) => {
      if (disabled === false && !item.enabled) {
        return false;
      }

      return true;
    });
  }

  async getFlag(name: string): Promise<Flag | null> {
    return this._itemStore.get(name) ?? null;
  }

  async upsertFlag(
    flag: Pick<Flag, "name" | "description" | "enabled" | "conditions">
  ): Promise<Flag> {
    const existing = await this.getFlag(flag.name);

    if (existing) {
      const item = {
        ...existing,
        ...flag,
        updatedAt: new Date(),
      };

      this._itemStore.set(flag.name, item);

      return item;
    } else {
      const item = {
        ...flag,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this._itemStore.set(flag.name, item);

      return item;
    }
  }

  async deleteFlag(name: string): Promise<void> {
    this._itemStore.delete(name);
  }
}
