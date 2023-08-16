import {
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
  region: string;
  endpoint?: string;
  bucket: string;
}

export class S3FilesAdapter extends FilesAdapter {
  private readonly _s3: S3Client;

  private readonly _bucket: string;

  constructor(options: S3FilesAdapterOptions) {
    super();

    this._s3 = new S3Client({
      credentials: options.credentials,
      region: options.region,
      endpoint: options.endpoint,
    });
    this._bucket = options.bucket;
  }

  async get(key: string) {
    const file = await this._s3.send(
      new GetObjectCommand({
        Bucket: this._bucket,
        Key: key,
      }),
    );

    return (file.Body as ReadableStream) ?? null;
  }

  async getMetadata(key: string) {
    const file = await this._s3.send(
      new GetObjectCommand({
        Bucket: this._bucket,
        Key: key,
      }),
    );

    return file.Metadata ?? null;
  }

  async put(
    key: string,
    stream: ReadableStream,
    metadata?: Record<string, string>,
  ) {
    await this._s3.send(
      new PutObjectCommand({
        Bucket: this._bucket,
        Key: key,
        Body: stream,
        Metadata: metadata,
      }),
    );
  }

  async delete(key: string) {
    await this._s3.send(
      new DeleteObjectCommand({
        Bucket: this._bucket,
        Key: key,
      }),
    );
  }
}
