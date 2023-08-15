---
title: "Storage"
description: How to customise how persistant data is stored in @workertown/kv.
---

In `@workertown/kv`, the storage is used to persist data about your
feature flags.

For more information on how storage works in Workertown services more generally,
see [storage](/docs/core-concepts/storage)

---

## `StorageAdapter`

The `StorageAdapter` interface is defined as follows:

```ts
declare class StorageAdapter {
  public getValue<T = unknown>(key: string): Promise<T | null> 
  public setValue<T = unknown>(key: string, value: T): Promise<T>
  public deleteValue(key: string): Promise<void>
}
```

---

## Built-in `StorageAdapter`s

`@workertown/kv` provides several built-in `StorageAdapter`s that can be used
via the `runtime` configuration option.

{% callout title="KV is \"special\"..." %}
This service is special in that it provides two extra storage adapters that are
not available in other services:

- [KV (the default)](#kv-storage-adapter)
- [Upstash Redis](#upstash-redis-storage-adapter)
{% /callout %}

### `D1StorageAdapter`

The `D1StorageAdapter` uses Cloudflare's
[D1](https://developers.cloudflare.com/d1/) to store the data.

```ts
import { search } from "@workertown/kv";
import { D1StorageAdapter } from "@workertown/kv/storage/d1";

export default search({
  runtime: (options, env) => ({
    cache: false,
    storage: new D1StorageAdapter({ d1: env.D1 }), // `d1` is the D1 database bound to the Cloudflare Worker to use for storage
  }),
});
```

### `KVStorageAdapter`

The `KVStorageAdapter` is the **default** `StorageAdapter` and is used when no
other `StorageAdapter` is specified. It uses Cloudflare's
[KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) to store
the data.

```ts
import { search } from "@workertown/kv";
import { KVStorageAdapter } from "@workertown/kv/storage/kv";

export default search({
  runtime: (options, env) => ({
    cache: false,
    storage: new KVStorageAdapter({ d1: env.KV }), // `d1` is the KV namespace bound to the Cloudflare Worker to use for storage
  }),
});
```

### `PlanetscaleStorageAdapter`

The `PlanetscaleStorageAdapter` uses [Planetscale](https://planetscale.com/) (a
distributed MySQL solution) to store the data.

```ts
import { search } from "@workertown/kv";
import { PlanetscaleStorageAdapter } from "@workertown/kv/storage/planetscale";

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
import { search } from "@workertown/kv";
import { SqliteStorageAdapter } from "@workertown/kv/storage/sqlite";

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
import { search } from "@workertown/kv";
import { TursoStorageAdapter } from "@workertown/kv/storage/turso";

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

### `UpstashRedisStorageAdapter`

The `UpstashRedisStorageAdapter` uses
[Upstash Redis](https://docs.upstash.com/redis), which provides Redis over a
REST API, to store the data.

```ts
import { search } from "@workertown/kv";
import { UpstashRedisStorageAdapter } from "@workertown/kv/storage/upstash-redis";

export default search({
  runtime: (options, env) => ({
    cache: false,
    storage: new UpstashRedisStorageAdapter({ 
      url: env.UPSTASH_REDIS_URL,
      token: env.UPSTASH_REDIS_TOKEN,
    }),
  }),
});
```

### `MemoryStorageAdapter`

The `MemoryStorageAdapter` is a simple `StorageAdapter` that stores the data in
memory. It is **not** recommended for production use, but can be useful for
development and testing.

```ts
import { search } from "@workertown/kv";
import { MemoryStorageAdapter } from "@workertown/kv/storage/memory";

export default search({
  runtime: (options, env) => ({
    cache: false,
    storage: new MemoryStorageAdapter(),
  }),
});
```

---

## Custom `StorageAdapter`s

You can also provide your own **custom** `CacheAdapter` by extending the
`CacheAdapter` class.

```ts
import { search } from "@workertown/kv";
import { StorageAdapter } from "@workertown/kv/storage";

class CustomStorageAdapter extends StorageAdapter {
  async getFlags(disabled: boolean = false) { /* ... */ },
  async getFlag(name: string) { /* ... */ },
  async upsertFlag(flag: UpsertFlagBody) { /* ... */ },
  async deleteFlag(name: string) { /* ... */ },
}

export default search({
  runtime: (options, env) => ({
    cache: false,
    storage: new CustomStorageAdapter(),
  }),
});
```
