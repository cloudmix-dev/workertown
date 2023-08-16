import {
  type R2Bucket,
  type ReadableStream as CFReadableStream,
} from "@cloudflare/workers-types";

import { FilesAdapter } from "./files-adapter.js";

export interface R2FilesAdapterOptions {
  r2: R2Bucket;
}

export class R2FilesAdapter extends FilesAdapter {
  private readonly _r2: R2Bucket;

  constructor(options: R2FilesAdapterOptions) {
    super();

    this._r2 = options.r2;
  }

  async get(key: string) {
    const file = await this._r2.get(key);

    return (file?.body as ReadableStream) ?? null;
  }

  async getMetadata(key: string) {
    const file = await this._r2.get(key);

    return file?.customMetadata ?? null;
  }

  async put(
    key: string,
    stream: ReadableStream,
    metadata?: Record<string, string>,
  ) {
    await this._r2.put(key, stream as CFReadableStream, {
      customMetadata: metadata,
    });
  }

  async delete(key: string) {
    await this._r2.delete(key);
  }
}
