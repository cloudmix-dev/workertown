---
title: "Storage"
description: How to customise how persistant data is stored in @workertown/search.
---

In `@workertown/search`, storage is used to persist data about your
documents.

For more information on how storage works in Workertown services more generally,
see [storage](/docs/core-concepts/storage)

---

## `StorageAdapter`

The `StorageAdapter` interface is defined as follows:

```ts
interface GetDocumentsOptions {
  limit: number;
  index?: string;
  tenant: string;
}

interface SearchDocument {
  id: string;
  tenant: string;
  index: string;
  data: Record<string, unknown>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface UpsertSearchDocumentBody {
  id: string;
  tenant: string;
  index: string;
  data: Record<string, unknown>;
}

declare class StorageAdapter {
  getDocuments(options: GetDocumentsOptions): Promise<SearchDocument[]>;
  getDocumentsByTags(tags: string[], options: GetDocumentsOptions ): Promise<SearchDocument[]>;
  getDocument(id: string): Promise<SearchDocument | null>;
  upsertDocument(item: UpsertSearchDocumentBody, tags: string[]): Promise<SearchDocument>;
  deleteDocument(id: string): Promise<void>;
  getTags(): Promise<string[]>;
}
```

---

## Built-in `StorageAdapter`s

`@workertown/search` provides several built-in `StorageAdapter`s that can be
used via the `runtime` configuration option.

### `D1StorageAdapter`

The `D1StorageAdapter` is the **default** `StorageAdapter` and is used when no
other `StorageAdapter` is specified. It uses Cloudflare's
[D1](https://developers.cloudflare.com/d1/) to store the data.

```ts
import { search } from "@workertown/search";
import { D1StorageAdapter } from "@workertown/search/storage/d1";

export default search({
  runtime: (options, env) => ({
    cache: false,
    storage: new D1StorageAdapter({ d1: env.D1 }), // `d1` is the D1 database bound to the Cloudflare Worker to use for storage
  }),
});
```

### `PlanetscaleStorageAdapter`

The `PlanetscaleStorageAdapter` uses [Planetscale](https://planetscale.com/) (a
distributed MySQL solution) to store the data.

```ts
import { search } from "@workertown/search";
import { PlanetscaleStorageAdapter } from "@workertown/search/storage/planetscale";

export default search({
  runtime: (options, env) => ({
    cache: false,
    storage: new PlanetscaleStorageAdapter({
      url: env.PLANETSCALE_URL,
      username: env.PLANETSCALE_USERNAME,
      password: env.PLANETSCALE_PASSWORD,
    }),
  }),
});
```

### `SqliteStorageAdapter`

The `SqliteStorageAdapter` uses [Sqlite](https://www.sqlite.org/index.html) to
store the data. It is intended to be used in [NodeJS](https://nodejs.org/)
environments as it requires access to file storage.

```ts
import { search } from "@workertown/search";
import { SqliteStorageAdapter } from "@workertown/search/storage/sqlite";

export default search({
  runtime: (options, env) => ({
    cache: false,
    storage: new SqliteStorageAdapter({ db: env.DB }), // `db` is the file path to the `.sqlite` file to use
  }),
});
```

### `TursoStorageAdapter`

The `TursoStorageAdapter` uses [Turso](https://turso.tech/) (a distributed
SQLite solution) to store the data.

```ts
import { search } from "@workertown/search";
import { TursoStorageAdapter } from "@workertown/search/storage/turso";

export default search({
  runtime: (options, env) => ({
    cache: false,
    storage: new TursoStorageAdapter({ 
      url: env.TURSO_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    }),
  }),
});
```

### `MemoryStorageAdapter`

The `MemoryStorageAdapter` is a simple `StorageAdapter` that stores the data in
memory. It is **not** recommended for production use, but can be useful for
development and testing.

```ts
import { search } from "@workertown/search";
import { MemoryStorageAdapter } from "@workertown/search/storage/memory";

export default search({
  runtime: (options, env) => ({
    cache: false,
    storage: new MemoryStorageAdapter(),
  }),
});
```

---

## Custom `StorageAdapter`s

You can also provide your own **custom** `StorageAdapter` by extending the
`StorageAdapter` class.

```ts
import { search } from "@workertown/search";
import { StorageAdapter } from "@workertown/search/storage";

class CustomStorageAdapter extends StorageAdapter {
  async getDocuments(options: GetDocumentsOptions) { /* ... */ },
  async getDocumentsByTags(tags: string[], options: GetDocumentsOptions ) { /* ... */ },
  async getDocument(id: string) { /* ... */ },
  async upsertDocument(item: UpsertSearchDocumentBody, tags: string[]) { /* ... */ },
  async deleteDocument(id: string) { /* ... */ },
  async getTags() { /* ... */ },
}

export default search({
  runtime: (options, env) => ({
    cache: false,
    storage: new CustomStorageAdapter(),
  }),
});
```
