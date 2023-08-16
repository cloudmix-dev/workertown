import { MemoryStorageAdapter as BaseMemoryStorageAdapter } from "@workertown/internal-storage/memory";

import {
  type CreateUploadUrlBody,
  type StorageAdapter,
  type UploadUrl,
} from "./storage-adapter.js";

interface MemoryStorageAdapterOptions {
  initialUploadUrls?: UploadUrl[];
}

export class MemoryStorageAdapter
  extends BaseMemoryStorageAdapter
  implements StorageAdapter
{
  private readonly _uploadUrlStore = new Map<string, UploadUrl>();

  constructor(options: MemoryStorageAdapterOptions = {}) {
    super();

    const { initialUploadUrls = [] } = options;

    initialUploadUrls.forEach((url) => {
      this._uploadUrlStore.set(url.id, url);
    });
  }

  public async getUploadUrl(id: string) {
    const url = this._uploadUrlStore.get(id);

    if (!url || url.expiresAt < new Date()) {
      return null;
    }

    return url;
  }

  public async createUploadUrl(body: CreateUploadUrlBody) {
    const id = Math.random().toString(36).slice(2);

    const uploadUrl: UploadUrl = {
      id,
      fileName: body.fileName,
      callbackUrl: body.callbackUrl,
      metadata: body.metadata,
      createdAt: new Date(),
      expiresAt: body.expiresAt,
    };

    this._uploadUrlStore.set(id, uploadUrl);

    return uploadUrl;
  }

  public async deleteUploadUrl(id: string) {
    this._uploadUrlStore.delete(id);
  }
}
