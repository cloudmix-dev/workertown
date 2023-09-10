import { StorageAdapter as BaseStorageAdapter } from "@workertown/internal-storage";

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
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertSearchDocumentBody {
  id: string;
  tenant: string;
  index: string;
  data: Record<string, unknown>;
}

export class StorageAdapter extends BaseStorageAdapter {
  public async getDocuments(
    // biome-ignore lint/correctness/noUnusedVariables: Stub class
    options: GetDocumentsOptions,
  ): Promise<SearchDocument[]> {
    throw new TypeError("'getDocuments()' not implemented");
  }

  public async getDocumentsByTags(
    // biome-ignore lint/correctness/noUnusedVariables: Stub class
    tags: string[],
    // biome-ignore lint/correctness/noUnusedVariables: Stub class
    options: GetDocumentsOptions,
  ): Promise<SearchDocument[]> {
    throw new TypeError("'getDocumentsByTags()' not implemented");
  }

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async getDocument(id: string): Promise<SearchDocument | null> {
    throw new TypeError("'getDocument()' not implemented");
  }

  public async upsertDocument(
    // biome-ignore lint/correctness/noUnusedVariables: Stub class
    item: UpsertSearchDocumentBody,
    // biome-ignore lint/correctness/noUnusedVariables: Stub class
    tags: string[] = [],
  ): Promise<SearchDocument> {
    throw new TypeError("'upsertDocument()' not implemented");
  }

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async deleteDocument(id: string): Promise<void> {
    throw new TypeError("'deleteDocument()' not implemented");
  }

  public async getTags(): Promise<string[]> {
    throw new TypeError("'getTags()' not implemented");
  }
}
