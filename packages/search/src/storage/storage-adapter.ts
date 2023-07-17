export interface GetDocumentsOptions {
  limit: number;
  index?: string;
  tenant: string;
}

export interface SearchDocument {
  id: string;
  tenant: string;
  index: string;
  data: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class StorageAdapter {
  async getDocuments(options: GetDocumentsOptions): Promise<SearchDocument[]> {
    throw new TypeError("'getDocuments()' not implemented");
  }

  async getDocumentsByTags(
    tags: string[],
    options: GetDocumentsOptions
  ): Promise<SearchDocument[]> {
    throw new TypeError("'getDocumentsByTags()' not implemented");
  }

  async getDocument(id: string): Promise<SearchDocument | null> {
    throw new TypeError("'getDocument()' not implemented");
  }

  async indexDocument(
    item: Pick<SearchDocument, "id" | "tenant" | "index" | "data">,
    tags: string[] = []
  ): Promise<SearchDocument> {
    throw new TypeError("'indexDocument()' not implemented");
  }

  async deleteDocument(id: string): Promise<void> {
    throw new TypeError("'deleteDocument()' not implemented");
  }

  async getTags(): Promise<string[]> {
    throw new TypeError("'getTags()' not implemented");
  }

  async tagDocument(id: string, tag: string): Promise<void> {
    throw new TypeError("'tagDocument()' not implemented");
  }

  async untagDocument(id: string, tag: string): Promise<void> {
    throw new TypeError("'untagDocument()' not implemented");
  }

  async runMigrations(): Promise<void> {}
}
