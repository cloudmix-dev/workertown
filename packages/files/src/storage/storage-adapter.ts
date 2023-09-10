import { StorageAdapter as BaseStorageAdapter } from "@workertown/internal-storage";

export interface UploadUrl {
  id: string;
  path: string;
  callbackUrl?: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateUploadUrlBody {
  path: string;
  callbackUrl?: string;
  metadata?: Record<string, string>;
  expiresAt: Date;
}

export class StorageAdapter extends BaseStorageAdapter {
  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async getUploadUrl(id: string): Promise<UploadUrl | null> {
    throw new Error("'getUploadUrl()' not implemented");
  }

  public async createUploadUrl(
    // biome-ignore lint/correctness/noUnusedVariables: Stub class
    body: CreateUploadUrlBody,
  ): Promise<UploadUrl> {
    throw new Error("'createUploadUrl()' not implemented");
  }

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async deleteUploadUrl(id: string): Promise<void> {
    throw new Error("'deleteUploadUrl()' not implemented");
  }
}
