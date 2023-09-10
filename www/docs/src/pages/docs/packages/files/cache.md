---
title: "Cache"
description: How to customise how data is cached for better performance in @workertown/feature-flags.
---

In `@workertown/feature-flags`, the cache is used to in front of certain
`storage` queries to improve performance.

When an ask operation is performed, the service will (if the cache is
**enabled** - it is by default) search for a cached version of the current
flags. If a cached version is found, it will **not** hit the `storage` and
instead use the cached set of flags.

When a feature flag is added/updated/deleted, the service will clear the cache.

For more information on how cache works in Workertown services more generally,
see [cache](/docs/core-concepts/cache)

---

## `CacheAdapter`

The `CacheAdapter` interface is defined as follows:

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

declare class CacheAdapter {
  get<Flag[]>(key: string): Promise<T | null>;
  set(key: string, value: Flag, ttl?: number): Promise<void>;
  delete(key?: string): Promise<void>;
}
```

---

## Built-in `CacheAdapter`s

`@workertown/feature-flags` provides several built-in `CacheAdapter`s that can
be used via the `runtime` configuration option.

### `KVCacheAdapter`

The `KVCacheAdapter` is the **default** `CacheAdapter` and is used when no other
`CacheAdapter` is specified. It uses Cloudflare Workers
[KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) to store
the cached data.

```ts
import { featureFlags } from "@workertown/feature-flags";
import { KVCacheAdapter } from "@workertown/feature-flags/cache/kv";
import { StorageAdapter } from "@workertown/feature-flags/storage";

export default featureFlags({
  runtime: (options, env) => ({
    cache: new KVCacheAdapter({ kv: env.KV }), // `kv` is the KVNamespace bound to the Cloudflare Worker to use for the cache
    storage: new StorageAdapter(/* ... */),
  }),
});
```

### `UpstashRedisCacheAdapter`

Coming soon...

### `MemoryCacheAdapter`

The `MemoryCacheAdapter` is a simple `CacheAdapter` that stores the cached data
in memory. It is **not** recommended for production use, but can be useful for
development and testing.

```ts
import { featureFlags } from "@workertown/feature-flags";
import { MemoryCacheAdapter } from "@workertown/feature-flags/cache/memory";
import { StorageAdapter } from "@workertown/feature-flags/storage";

export default featureFlags({
  runtime: (options, env) => ({
    cache: new MemoryCacheAdapter(),
    storage: new StorageAdapter(/* ... */),
  }),
});
```

### `NoOpCacheAdapter`

The `NoOpCacheAdapter` is a `CacheAdapter` that does **nothing**. It is provided
simply for situations where you want to provide a `CacheAdapter` instance but
don't want it to do anything.

```ts
import { featureFlags } from "@workertown/feature-flags";
import { NoOpCacheAdapter } from "@workertown/feature-flags/cache/no-op";
import { StorageAdapter } from "@workertown/feature-flags/storage";

export default featureFlags({
  runtime: (options, env) => ({
    cache: new NoOpCacheAdapter(),
    storage: new StorageAdapter(/* ... */),
  }),
});
```

---

## Custom `CacheAdapter`s

You can also provide your own **custom** `CacheAdapter` by extending the
`CacheAdapter` class.

```ts
import { featureFlags } from "@workertown/feature-flags";
import { CacheAdapter, type Flag } from "@workertown/feature-flags/cache";
import { StorageAdapter } from "@workertown/feature-flags/storage";

class CustomCacheAdapter extends CacheAdapter {
  async get(key: string) { /* .. */ },
  async set(key: string, value: Flag, ttl?: number) { /* .. */ },
  async delete(key?: string) { /* .. */ },
}

export default featureFlags({
  runtime: (options, env) => ({
    cache: new CustomCacheAdapter(),
    storage: new StorageAdapter(/* ... */),
  }),
});
```
