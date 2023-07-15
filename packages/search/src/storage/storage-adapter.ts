export interface GetItemsOptions {
  limit: number;
  index?: string;
  tenant: string;
}

export interface SearchItem {
  id: string;
  tenant: string;
  index: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class StorageAdapter {
  async getItems(options: GetItemsOptions): Promise<SearchItem[]> {
    throw new TypeError("'getItems()' not implemented");
  }

  async getItemsByTags(
    tags: string[],
    options: GetItemsOptions
  ): Promise<SearchItem[]> {
    throw new TypeError("'getItemsByTags()' not implemented");
  }

  async getItem(id: string): Promise<SearchItem | null> {
    throw new TypeError("'getItem()' not implemented");
  }

  async indexItem(
    item: Pick<SearchItem, "id" | "tenant" | "index" | "data">,
    tags: string[] = []
  ): Promise<SearchItem> {
    throw new TypeError("'indexItem()' not implemented");
  }

  async deleteItem(id: string): Promise<void> {
    throw new TypeError("'deleteItem()' not implemented");
  }

  async getTags(): Promise<string[]> {
    throw new TypeError("'getTags()' not implemented");
  }

  async tagItem(id: string, tag: string): Promise<void> {
    throw new TypeError("'tagItem()' not implemented");
  }

  async untagItem(id: string, tag: string): Promise<void> {
    throw new TypeError("'untagItem()' not implemented");
  }

  async runMigrations(): Promise<void> {}
}
