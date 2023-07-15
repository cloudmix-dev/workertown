import {
  type GetItemsOptions,
  type SearchItem,
  StorageAdapter,
} from "./storage-adapter";

export class MemoryStorageAdapter extends StorageAdapter {
  private _itemStore = new Map<string, SearchItem>();

  private _tenantIndex = new Map<string, Set<string>>();

  private _updatedIndex = new Map<string, string>();

  private _tags = new Map<string, Set<string>>();

  private _deleted = new Set<string>();

  constructor(
    initialItems: SearchItem[] = [],
    tags: Record<string, string[]> = {}
  ) {
    super();

    initialItems.forEach((item) => {
      this._storeItem(item);
    });

    Object.keys(tags).forEach((tag) => {
      this._tags.set(tag, new Set(tags[tag]));
    });
  }

  private _storeItem(item: SearchItem) {
    this._itemStore.set(item.id, item);

    if (!this._tenantIndex.has(item.tenant)) {
      this._tenantIndex.set(item.tenant, new Set<string>());
    }

    this._tenantIndex.get(item.tenant)!.add(item.id);

    if (!this._tenantIndex.has(`${item.tenant}_${item.index}`)) {
      this._tenantIndex.set(`${item.tenant}_${item.index}`, new Set<string>());
    }

    this._tenantIndex.get(`${item.tenant}_${item.index}`)!.add(item.id);

    this._updatedIndex.set(`${item.updatedAt.getTime()}_${item.id}`, item.id);
  }

  private _getSortedItems() {
    const sortedItems = Array.from(this._updatedIndex.entries()).sort(
      ([a], [b]) => (b > a ? 1 : -1)
    );

    return sortedItems.map(([, id]) => this._itemStore.get(id)!);
  }

  async getItems(options: GetItemsOptions): Promise<SearchItem[]> {
    const { index, tenant, limit } = options;
    const indexKey = index ? `${tenant}_${index}` : tenant;
    const indexSet = this._tenantIndex.get(indexKey);

    if (!indexSet) {
      return [];
    }

    const ids = Array.from(indexSet ?? []);
    const sortedItems = this._getSortedItems();
    const bucket = new Array(sortedItems.length).fill(null);

    ids.forEach((id) => {
      if (!this._deleted.has(id)) {
        const item = this._itemStore.get(id);
        const index = sortedItems.findIndex((item) => item.id === id);

        bucket[index] = item;
      }
    });

    return bucket.filter((item) => item !== null).slice(0, limit);
  }

  async getItemsByTags(
    tags: string[],
    options: GetItemsOptions
  ): Promise<SearchItem[]> {
    const { index, tenant, limit } = options;
    const tagSet = new Set(
      tags.flatMap((tag) => Array.from(this._tags.get(tag) ?? []))
    );

    if (tagSet.size === 0) {
      return [];
    }

    const indexKey = index ? `${tenant}_${index}` : tenant;
    const indexSet = this._tenantIndex.get(indexKey);

    if (!indexSet) {
      return [];
    }

    const ids = Array.from(indexSet ?? []);
    const sortedItems = this._getSortedItems();
    const bucket = new Array(sortedItems.length).fill(null);

    ids.forEach((id) => {
      if (!this._deleted.has(id) && tagSet.has(id)) {
        const item = this._itemStore.get(id);
        const index = sortedItems.findIndex((item) => item.id === id);

        bucket[index] = item;
      }
    });

    return bucket.filter((item) => item !== null).slice(0, limit);
  }

  async getItem(id: string): Promise<SearchItem | null> {
    return this._itemStore.get(id) ?? null;
  }

  async indexItem(
    item: Pick<SearchItem, "id" | "tenant" | "index" | "data">,
    tags: string[] = []
  ): Promise<SearchItem> {
    const now = new Date();
    const existing = this._itemStore.get(item.id);
    const searchItem = existing ?? {
      ...item,
      updatedAt: now,
      createdAt: now,
    };

    searchItem.updatedAt = now;

    this._storeItem(searchItem);

    if (tags.length) {
      tags.forEach((tag) => {
        if (!this._tags.has(tag)) {
          this._tags.set(tag, new Set<string>());
        }

        const tagSet = this._tags.get(tag);

        tagSet!.add(item.id);
      });
    }

    this._deleted.delete(item.id);

    return searchItem;
  }

  async deleteItem(id: string): Promise<void> {
    this._deleted.add(id);
  }

  async getTags(): Promise<string[]> {
    return Array.from(this._tags.keys());
  }

  async tagItem(id: string, tag: string): Promise<void> {
    if (!this._tags.has(tag)) {
      this._tags.set(tag, new Set<string>());
    }

    const tagSet = this._tags.get(tag);

    tagSet!.add(id);
  }

  async untagItem(id: string, tag: string): Promise<void> {
    if (!this._tags.has(tag)) {
      return;
    }

    const tagSet = this._tags.get(tag);

    tagSet!.delete(id);
  }

  reset() {
    this._itemStore.clear();
    this._tenantIndex.clear();
    this._updatedIndex.clear();
    this._tags.clear();
    this._deleted.clear();
  }
}
