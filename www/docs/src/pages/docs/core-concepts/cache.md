---
title: Cache
description: Quidem magni aut exercitationem maxime rerum eos.
---

Some Workertown services provide the ability to configure a cache that sits in
front of potentially expensive/slow `storage` operations. Following the
"sensible defaults" paradigm, each of these services provides a default storage
adapter built upon
[Cloudflare Workers KV](https://developers.cloudflare.com/workers/learning/how-kv-works/),
but there are other options available, and also the ability to bring your own
cache adapter entirely.

Cachsupport is **always optional**, and while it is **on** by default it can be
disabled easily in the service's `runtime` configuration option.

---

## Built-in cache adapters

Every Workertown service with cache support has a set of supported first-party
cache adapters provided within the package.

### KV (default)

The 
[Cloudflare Workers KV](https://developers.cloudflare.com/workers/learning/how-kv-works/)
cache adapter is the **default** cache adapter for all Workertown services that
support a cache, and so any Workertown service that supports a cache can have a
bound KV namespace by default.

The `KVCacheAdapter` is exposed from each package, but in reality you should
**never** have to manually instantiate this adapter.

```ts
import { search } from "@workertown/search";
import { KVCacheAdapter } from "@workertown/search/cache/kv";

export default search({
  runtime: (options, env) => ({
   cache: new KVCacheAdapter({ kv: env.KV }),
    // Other options go here...
  }),
});
```

```c
[[kv_namespaces]]
binding = "KV"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### Upstash Redis

The [Upstash Redis](https://docs.upstash.com/redis)  cache adapter uses
Upstash's Redis cache API to provide an edge-compatible cache.

```ts
import { search } from "@workertown/search";
import { UpstashRedisCacheAdapter } from "@workertown/search/cache/upstash-redis";

export default search({
  runtime: (options, env) => ({
   cache: new UpstashRedisCacheAdapter({ 
      url: env.UPSTASH_REDIS_URL,
      token: env.UPSTASH_REDIS_TOKEN,
    }),
    // Other options go here...
  }),
});
```

### Memory

For situations where you would like to only **simulate** cache (such as when
running tests), you can use the `MemoryCacheAdapter` to store cached data in
memory.

This will **not** persist any data to disk, and therefore any values stored are
lost when the process is terminated.

```ts
import { search } from "@workertown/search";
import { MemoryCacheAdapter } from "@workertown/search/cache/memory";

export default search({
  runtime: {
    cache: new MemoryCacheAdapter(),
    // Other options go here...
  },
});
```

{% callout type="warning" title="For development use only" %}
The memory cache adapter is not recommended for production use, and should
usually only be used in development/test environments.
{% /callout %}

### No-op

The `NoopCacheAdapter` is a special cache adapter that does **nothing**™. It is
useful for disabling cache support entirely in situations where you still want
to provide a `CacheAdapter` instance.

```ts
import { search } from "@workertown/search";
import { NoOpCacheAdapter } from "@workertown/search/cache/memory";

export default search({
  runtime: {
    cache: new NoOpCacheAdapter(),
    // Other options go here...
  },
});
```
