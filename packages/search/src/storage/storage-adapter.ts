import { StorageAdapter as BaseStorageAdapter } from "@workertown/storage";

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

export class StorageAdapter extends BaseStorageAdapter {
  public async getDocuments(
    options: GetDocumentsOptions
  ): Promise<SearchDocument[]> {
    throw new TypeError("'getDocuments()' not implemented");
  }

  public async getDocumentsByTags(
    tags: string[],
    options: GetDocumentsOptions
  ): Promise<SearchDocument[]> {
    throw new TypeError("'getDocumentsByTags()' not implemented");
  }

  public async getDocument(id: string): Promise<SearchDocument | null> {
    throw new TypeError("'getDocument()' not implemented");
  }

  public async indexDocument(
    item: Pick<SearchDocument, "id" | "tenant" | "index" | "data">,
    tags: string[] = []
  ): Promise<SearchDocument> {
    throw new TypeError("'indexDocument()' not implemented");
  }

  public async deleteDocument(id: string): Promise<void> {
    throw new TypeError("'deleteDocument()' not implemented");
  }

  public async getTags(): Promise<string[]> {
    throw new TypeError("'getTags()' not implemented");
  }

  public async tagDocument(id: string, tag: string): Promise<void> {
    throw new TypeError("'tagDocument()' not implemented");
  }

  public async untagDocument(id: string, tag: string): Promise<void> {
    throw new TypeError("'untagDocument()' not implemented");
  }
}
