import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { FilesAdapter } from "./files-adapter.js";

export interface S3FilesAdapterOptions {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  region?: string;
  endpoint?: string;
  bucket: string;
}

export class S3FilesAdapter extends FilesAdapter {
  private readonly _client: S3Client;

  private readonly _bucket: string;

  constructor(options: S3FilesAdapterOptions) {
    super();

    this._client = new S3Client({
      credentials: options.credentials,
      region: options.region,
      endpoint: options.endpoint,
      forcePathStyle: true,
    });
    this._bucket = options.bucket;
  }

  private _sanitizeKey(key: string) {
    if (key.startsWith("/")) {
      return key.slice(1);
    }

    return key;
  }

  async get(key: string) {
    try {
      const file = await this._client.send(
        new GetObjectCommand({
          Bucket: this._bucket,
          Key: this._sanitizeKey(key),
        }),
      );

      return file.Body?.transformToWebStream() ?? null;
    } catch (_) {
      return null;
    }
  }

  async getMetadata(key: string) {
    try {
      const file = await this._client.send(
        new GetObjectCommand({
          Bucket: this._bucket,
          Key: this._sanitizeKey(key),
        }),
      );

      return file.Metadata ?? null;
    } catch (_) {
      return null;
    }
  }

  async put(
    key: string,
    stream: ReadableStream | Uint8Array | Blob,
    metadata?: Record<string, string>,
  ) {
    await this._client.send(
      new PutObjectCommand({
        Bucket: this._bucket,
        Key: this._sanitizeKey(key),
        Body: stream,
        Metadata: metadata,
      }),
    );
  }

  async delete(key: string) {
    try {
      await this._client.send(
        new DeleteObjectCommand({
          Bucket: this._bucket,
          Key: this._sanitizeKey(key),
        }),
      );
    } catch (_) {}
  }

  public async setup(down?: boolean) {
    try {
      if (!down) {
        await this._client.send(
          new CreateBucketCommand({
            Bucket: this._bucket,
          }),
        );
      } else {
        await this._client.send(
          new DeleteBucketCommand({
            Bucket: this._bucket,
          }),
        );
      }

      return true;
    } catch (_) {
      return false;
    }
  }
}
