---
title: "Storage"
description: How to customise how files are stored stored in @workertown/files.
---

In `@workertown/files`, files storage is used the files you upload - you can
back `@workertown/files` with the object store of your choice.

---

## `FilesAdapter`

The `FilesAdapter` interface is defined as follows:

```ts
declare class FilesAdapter {
  get(key: string): Promise<ReadableStream | null>
  getMetadata(key: string): Promise<Record<string, unknown> | null>
  put(key: string, stream: ReadableStream | Uint8Array | Blob, metadata?: Record<string, string>): Promise<void>
  delete(key: string): Promise<void>
  setup(down?: boolean): Promise<boolean>
}
```

---

## Built-in `FilesAdapter`s

`@workertown/files` provides serveral built-in `FilesAdapter`s that can be used
via the `runtime` configuration option.

### `R2StorageAdapter`

The `R2StorageAdapter` is the **default** `FilesAdapter` and is used when no
other `FilesAdapter` is specified. It uses Cloudflare's
[R2](https://developers.cloudflare.com/r2/) to store files.

```ts
import { files } from "@workertown/files";
import { R2FilesAdapter } from "@workertown/files/files/r2";

export default files({
  runtime: (options, env) => ({
    files: new R2FilesAdapter({ d1: env.R2 }), // `r2` is the R2 bucket bound to the Cloudflare Worker to use for file storage
    //...other options
  }),
});
```

### `S3FilesAdapter`

The `S3FilesAdapter` uses [AWS S3](https://aws.amazon.com/s3/) (or any
S3-compatible object store) to store files.

```ts
import { files } from "@workertown/files";
import { S3FilesAdapter } from "@workertown/files/files/s3";

export default files({
  runtime: (options, env) => ({
    files: new PlanetscaleStorageAdapter({
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      };
      region: env.AWS_REGION,
      endpoint: env.AWS_ENDPOINT,
      bucket: env.AWS_BUCKET,
    }),
    //...other options
  }),
});
```

### `MemoryFilesAdapter`

The `MemoryFilesAdapter` is a simple `FilesAdapter` that stores the files in
memory. It is **not** recommended for production use, but can be useful for
development and testing.

```ts
import { files } from "@workertown/files";
import { MemoryFilesAdapter } from "@workertown/files/files/memory";

export default files({
  runtime: (options, env) => ({
    files: new MemoryFilesAdapter(),
    //...other options
  }),
});
```

---

## Custom `FilesAdapter`s

You can also provide your own **custom** `FilesAdapter` by extending the
`FilesAdapter` class.

```ts
import { files } from "@workertown/files";
import { StorageAdapter } from "@workertown/files/storage";

class CustomFilesAdapter extends FilesAdapter {
  async get(key: string) { /* ... */ },
  async getMetadata(key: string) { /* ... */ },
  async put(key: string, stream: ReadableStream | Uint8Array | Blob, metadata?: Record<string, string>) { /* ... */ },
  async delete(key: string) { /* ... */ },
  async setup(down?: boolean) { /* ... */ },
}

export default files({
  runtime: (options, env) => ({
    files: new CustomFilesAdapter(),
    //...other options
  }),
});
```
