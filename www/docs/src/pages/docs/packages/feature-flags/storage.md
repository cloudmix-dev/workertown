---
title: "Storage"
description: How to customise how persistant data is stored in @workertown/feature-flags.
---

In `@workertown/feature-flags`, storage is used to persist data about your
feature flags.

For more information on how storage works in Workertown services more generally,
see [storage](/docs/core-concepts/storage)

---

## `StorageAdapter`

The `StorageAdapter` interface is defined as follows:

```ts
interface FlagCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin";
  value: string | number | boolean | string[] | number[] | boolean[];
}

interface Flag {
  name: string;
  description?: string;
  enabled: boolean;
  conditions?: FlagCondition[];
  createdAt: Date;
  updatedAt: Date;
}

interface UpsertFlagBody {
  name: string;
  description?: string;
  enabled: boolean;
  conditions?: FlagCondition[];
}

declare class StorageAdapter {
  getFlags(disabled: boolean = false): Promise<Flag[]>;
  getFlag(name: string): Promise<Flag | null>;
  upsertFlag(flag: UpsertFlagBody): Promise<Flag>;
  deleteFlag(name: string): Promise<void>:
}
```

---

## Built-in `StorageAdapter`s

`@workertown/feature-flags` provides several built-in `StorageAdapter`s that can
be used via the `runtime` configuration option.

### `D1StorageAdapter`

The `D1StorageAdapter` is the **default** `StorageAdapter` and is used when no
other `StorageAdapter` is specified. It uses Cloudflare's
[D1](https://developers.cloudflare.com/d1/) to store the data.

```ts
import { featureFlags } from "@workertown/feature-flags";
import { D1StorageAdapter } from "@workertown/feature-flags/storage/d1";

export default featureFlags({
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
import { featureFlags } from "@workertown/feature-flags";
import { PlanetscaleStorageAdapter } from "@workertown/feature-flags/storage/planetscale";

export default featureFlags({
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
import { featureFlags } from "@workertown/feature-flags";
import { SqliteStorageAdapter } from "@workertown/feature-flags/storage/sqlite";

export default featureFlags({
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
import { featureFlags } from "@workertown/feature-flags";
import { TursoStorageAdapter } from "@workertown/feature-flags/storage/turso";

export default featureFlags({
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
import { featureFlags } from "@workertown/feature-flags";
import { MemoryStorageAdapter } from "@workertown/feature-flags/storage/memory";

export default featureFlags({
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
import { featureFlags } from "@workertown/feature-flags";
import { StorageAdapter } from "@workertown/feature-flags/storage";

class CustomStorageAdapter extends StorageAdapter {
  async getFlags(disabled: boolean = false) { /* ... */ },
  async getFlag(name: string) { /* ... */ },
  async upsertFlag(flag: UpsertFlagBody) { /* ... */ },
  async deleteFlag(name: string) { /* ... */ },
}

export default featureFlags({
  runtime: (options, env) => ({
    cache: false,
    storage: new CustomStorageAdapter(),
  }),
});
```
