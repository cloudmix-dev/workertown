---
title: "Storage"
description: How to customise how persistant data is stored in @workertown/files.
---

In `@workertown/files`, storage is used to persist data about your upload URLs.

For more information on how storage works in Workertown services more generally,
see [storage](/docs/core-concepts/storage)

---

## `StorageAdapter`

The `StorageAdapter` interface is defined as follows:

```ts
interface UploadUrl {
  id: string;
  path: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  expiresAt: Date;
}

interface CreateUploadUrlBody {
  path: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
  expiresAt: Date;
}

declare class StorageAdapter {
  getUploadUrl(id: string): Promise<UploadUrl | null>
  createUploadUrl(body: CreateUploadUrlBody): Promise<UploadUrl | null>
  deleteUploadUrl(id: string): Promise<void>
}
```

---

## Built-in `StorageAdapter`s

`@workertown/files` provides several built-in `StorageAdapter`s that can be used
via the `runtime` configuration option.

### `D1StorageAdapter`

The `D1StorageAdapter` is the **default** `StorageAdapter` and is used when no
other `StorageAdapter` is specified. It uses Cloudflare's
[D1](https://developers.cloudflare.com/d1/) to store the data.

```ts
import { files } from "@workertown/files";
import { D1StorageAdapter } from "@workertown/files/storage/d1";

export default files({
  runtime: (options, env) => ({
    storage: new D1StorageAdapter({ d1: env.D1 }), // `d1` is the D1 database bound to the Cloudflare Worker to use for storage
    //...other options
  }),
});
```

### `PlanetscaleStorageAdapter`

The `PlanetscaleStorageAdapter` uses [Planetscale](https://planetscale.com/) (a
distributed MySQL solution) to store the data.

```ts
import { files } from "@workertown/files";
import { PlanetscaleStorageAdapter } from "@workertown/files/storage/planetscale";

export default files({
  runtime: (options, env) => ({
    storage: new PlanetscaleStorageAdapter({
      url: env.PLANETSCALE_URL,
      username: env.PLANETSCALE_USERNAME,
      password: env.PLANETSCALE_PASSWORD,
    }),
    //...other options
  }),
});
```

### `SqliteStorageAdapter`

The `SqliteStorageAdapter` uses [Sqlite](https://www.sqlite.org/index.html) to
store the data. It is intended to be used in [NodeJS](https://nodejs.org/)
environments as it requires access to file storage.

```ts
import { files } from "@workertown/files";
import { SqliteStorageAdapter } from "@workertown/files/storage/sqlite";

export default files({
  runtime: (options, env) => ({
    storage: new SqliteStorageAdapter({ db: env.DB }), // `db` is the file path to the `.sqlite` file to use
    //...other options
  }),
});
```

### `TursoStorageAdapter`

The `TursoStorageAdapter` uses [Turso](https://turso.tech/) (a distributed
SQLite solution) to store the data.

```ts
import { files } from "@workertown/files";
import { TursoStorageAdapter } from "@workertown/files/storage/turso";

export default files({
  runtime: (options, env) => ({
    storage: new TursoStorageAdapter({ 
      url: env.TURSO_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    }),
    //...other options
  }),
});
```

### `MemoryStorageAdapter`

The `MemoryStorageAdapter` is a simple `StorageAdapter` that stores the data in
memory. It is **not** recommended for production use, but can be useful for
development and testing.

```ts
import { files } from "@workertown/files";
import { MemoryStorageAdapter } from "@workertown/files/storage/memory";

export default files({
  runtime: (options, env) => ({
    storage: new MemoryStorageAdapter(),
    //...other options
  }),
});
```

---

## Custom `StorageAdapter`s

You can also provide your own **custom** `StorageAdapter` by extending the
`StorageAdapter` class.

```ts
import { files } from "@workertown/files";

import { StorageAdapter } from "@workertown/files/storage";

class CustomStorageAdapter extends StorageAdapter {
  async getUploadUrl(id: string) { /* ... */ },
  async createUploadUrl(body: CreateUploadUrlBody) { /* ... */ },
  async deleteUploadUrl(id: string) { /* ... */ },
}

export default files({
  runtime: (options, env) => ({
    storage: new CustomStorageAdapter(),
    //...other options
  }),
});
```
