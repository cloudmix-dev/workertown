import { StorageAdapter as BaseStorageAdapter } from "@workertown/internal-storage";

export interface UploadUrl {
  id: string;
  fileName: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateUploadUrlBody {
  fileName: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  expiresAt: Date;
}

export class StorageAdapter extends BaseStorageAdapter {
  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async getUploadUrl(id: string): Promise<UploadUrl | null> {
    throw new Error("'getUploadUrl()' not implemented");
  }

  public async createUploadUrl(
    // rome-ignore lint/correctness/noUnusedVariables: stub class
    body: CreateUploadUrlBody,
  ): Promise<UploadUrl | null> {
    throw new Error("'createUploadUrl()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async deleteUploadUrl(id: string): Promise<void> {
    throw new Error("'deleteUploadUrl()' not implemented");
  }
}
