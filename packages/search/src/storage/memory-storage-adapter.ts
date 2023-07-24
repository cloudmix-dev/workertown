import { MemoryStorageAdapter as BaseMemoryStorageAdapter } from "@workertown/internal-storage/memory-storage-adapter";

import {
  type GetDocumentsOptions,
  type SearchDocument,
  StorageAdapter,
  type UpsertSearchDocumentBody,
} from "./storage-adapter.js";

interface MemoryStorageAdapterOptions {
  initialDocuments?: SearchDocument[];
  initialTags?: Record<string, string[]>;
}

export class MemoryStorageAdapter
  extends BaseMemoryStorageAdapter
  implements StorageAdapter
{
  private readonly _documentStore = new Map<string, SearchDocument>();

  private readonly _tenantIndex = new Map<string, Set<string>>();

  private readonly _updatedIndex = new Map<string, string>();

  private readonly _tags = new Map<string, Set<string>>();

  private readonly _deleted = new Set<string>();

  constructor(options: MemoryStorageAdapterOptions = {}) {
    super();

    const { initialDocuments = [], initialTags = {} } = options;

    initialDocuments.forEach((document) => {
      this._storeDocument(document);
    });

    Object.keys(initialTags).forEach((tag) => {
      this._tags.set(tag, new Set(initialTags[tag]));
    });
  }

  private _storeDocument(document: SearchDocument) {
    this._documentStore.set(document.id, document);

    if (!this._tenantIndex.has(document.tenant)) {
      this._tenantIndex.set(document.tenant, new Set<string>());
    }

    this._tenantIndex.get(document.tenant)?.add(document.id);

    if (!this._tenantIndex.has(`${document.tenant}_${document.index}`)) {
      this._tenantIndex.set(
        `${document.tenant}_${document.index}`,
        new Set<string>(),
      );
    }

    this._tenantIndex
      .get(`${document.tenant}_${document.index}`)
      ?.add(document.id);

    this._updatedIndex.set(
      `${document.updatedAt.getTime()}_${document.id}`,
      document.id,
    );
  }

  private _getSortedDocuments() {
    const sortedDocuments = Array.from(this._updatedIndex.entries()).sort(
      ([a], [b]) => (b > a ? 1 : -1),
    );

    return sortedDocuments.map(([, id]) => this._documentStore.get(id));
  }

  public async getDocuments(
    options: GetDocumentsOptions,
  ): Promise<SearchDocument[]> {
    const { index, tenant, limit } = options;
    const indexKey = index ? `${tenant}_${index}` : tenant;
    const indexSet = this._tenantIndex.get(indexKey);

    if (!indexSet) {
      return [];
    }

    const ids = Array.from(indexSet ?? []);
    const sortedDocuments = this._getSortedDocuments();
    const bucket = new Array(sortedDocuments.length).fill(null);

    ids.forEach((id) => {
      if (!this._deleted.has(id)) {
        const document = this._documentStore.get(id);
        const index = sortedDocuments.findIndex(
          (document) => document?.id === id,
        );

        bucket[index] = document;
      }
    });

    return bucket.filter((document) => document !== null).slice(0, limit);
  }

  public async getDocumentsByTags(
    tags: string[],
    options: GetDocumentsOptions,
  ): Promise<SearchDocument[]> {
    const { index, tenant, limit } = options;
    const tagSet = new Set(
      tags.flatMap((tag) => Array.from(this._tags.get(tag) ?? [])),
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
    const sortedDocuments = this._getSortedDocuments();
    const bucket = new Array(sortedDocuments.length).fill(null);

    ids.forEach((id) => {
      if (!this._deleted.has(id) && tagSet.has(id)) {
        const document = this._documentStore.get(id);
        const index = sortedDocuments.findIndex(
          (document) => document?.id === id,
        );

        bucket[index] = document;
      }
    });

    return bucket.filter((document) => document !== null).slice(0, limit);
  }

  public async getDocument(id: string): Promise<SearchDocument | null> {
    return this._documentStore.get(id) ?? null;
  }

  public async upsertDocument(
    document: UpsertSearchDocumentBody,
    tags: string[] = [],
  ): Promise<SearchDocument> {
    const now = new Date();
    const existing = this._documentStore.get(document.id);
    const searchDocument = existing ?? {
      ...document,
      updatedAt: now,
      createdAt: now,
    };

    searchDocument.updatedAt = now;

    this._storeDocument(searchDocument);

    if (tags.length) {
      tags.forEach((tag) => {
        if (!this._tags.has(tag)) {
          this._tags.set(tag, new Set<string>());
        }

        const tagSet = this._tags.get(tag);

        tagSet?.add(document.id);
      });
    }

    this._deleted.delete(document.id);

    return searchDocument;
  }

  public async deleteDocument(id: string): Promise<void> {
    this._deleted.add(id);
  }

  public async getTags(): Promise<string[]> {
    return Array.from(this._tags.keys());
  }

  public async tagDocument(id: string, tag: string): Promise<void> {
    if (!this._tags.has(tag)) {
      this._tags.set(tag, new Set<string>());
    }

    const tagSet = this._tags.get(tag);

    tagSet?.add(id);
  }

  public async untagDocument(id: string, tag: string): Promise<void> {
    if (!this._tags.has(tag)) {
      return;
    }

    const tagSet = this._tags.get(tag);

    tagSet?.delete(id);
  }

  public reset() {
    this._documentStore.clear();
    this._tenantIndex.clear();
    this._updatedIndex.clear();
    this._tags.clear();
    this._deleted.clear();
  }
}
