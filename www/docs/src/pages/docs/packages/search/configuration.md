---
title: "Configuration"
description: How to configure @workertown/search to best suite your requirements.
---

As with all Workertown services, `@workertown/search` is highly configurable.
This page describes the various configuration options available.

**All** configuration options are **optional**.

---

## `access`

By default, access restrictions are **disabled**. For details on how to
configure the `access` property, see
[access](/docs/core-concepts/configuration#access).

---

## `auth`

By default, **all** authentication strategies are **enabled** and configured via
environment variables. For details on how to configure the `auth` property, see
[authentication](/docs/core-concepts/authentication).

### `auth.apiKey`

By default, the `auth.apiKey` strategy is **enabled** and configured as follows:

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    apiKey: {
      env: {
        apiKey: "SEARCH_API_KEY",
      },
    },
  },
});
```

For details on how to configure the `auth.apiKey` strategy, see
[API key](/docs/core-concepts/authentication#api-key).

### `auth.basic`

By default, the `auth.basic` strategy is **enabled** and configured as follows:

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    basic: {
      env: {
        username: "SEARCH_USERNAME",
        password: "SEARCH_PASSWORD",
      },
    },
  },
});
```

For details on how to configure the `auth.basic` strategy, see
[basic authentication](/docs/core-concepts/authentication#basic-username-password).


### `auth.jwt`

By default, the `auth.jwt` strategy is **enabled** and configured as follows:

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    jwt: {
      env: {
        jwksUrl: "SEARCH_JWKS_URL",
        secret: "SEARCH_JWT_SECRET",
        audience: "SEARCH_JWT_AUDIENCE",
        issuer: "SEARCH_JWT_ISSUER",
      },
    },
  },
});
```

For details on how to configure the `auth.jwt` strategy, see
[JSON Web Token](/docs/core-concepts/authentication#jwt).

---

## `basePath`

By default, the `basePath` is set to `/`. For details on how to configure the
`basePath` property, see [base path](/docs/core-concepts/configuration#base-path).

---

## `cors`

By default, CORS is **disabled**. For details on how to configure the `cors`
property, see [CORS](/docs/core-concepts/configuration#cors).

---

## `endpoints`

The `endpoints` property is used to configure the various endpoints exposed by
the service. By default, the endpoints are configured as follows:

```ts
import { search } from "@workertown/search";

export default search({
  endpoints: {
    v1: {
      admin: "/v1/admin",
      documents: "/v1/docs",
      search: "/v1/search",
      suggest: "/v1/suggest",
      tags: "/v1/tags",
    },
    public: "/",
  },
});
```

Changing these endpoints will **only** change the prefix of a particular
endpoint, **not** the entire path - e.g. setting `endpoints.v1.search` to
`"custom-search"` will change `/v1/search/:tenant/:index` to
`/custom-search/:tenant/:index`.

---

## `env`

The `env` property is used to configure the various environment variables used
by the service. By default, the environment variables are configured as follows:

```ts
import { search } from "@workertown/search";

export default search({
  env: {
    cache: "SEARCH_CACHE",
    db: "SEARCH_DB",
  },
});
```

While **all** the `env` property options have **predefined** uses within the
**built-in** runtimes, they can be repurposed for use with your own custom
configurations when using the [`runtime`](#runtime) property.

### `env.cache`

The `env.cache` property is a `string` identifying which environment variable
contains the name of the
[KV namespace](https://developers.cloudflare.com/workers/learning/how-kv-works/)
for the cache.

### `env.db`

The `env.db` property is a `string` identifying which environment variable
contains the name of the [D1 database](https://developers.cloudflare.com/d1/)
binding for the storage, **or** a `string` identifying the file path to the
`.sqlite` database file in [NodeJS](https://nodejs.org/) environments.

---

## `logger`

By default, the logger is **enabled**. For details on how to configure the
`logger` property, see [logger](/docs/core-concepts/configuration#logger).

---

## `runtime`

The `@workertown/search` package expects a `runtime` property that returns a
`cache` value and a `storage` value. This can *either* be an `object` with those
properties set, or a `function` that returns an `object` with those properties
set.

For more details on how runtime in WorkerTown services work, see
[runtime](/docs/core-concepts/runtime).

### The default runtime

The **default** runtime for `@workertown/search` assumes that the service is
running in a Cloudflare Worker with a
[KV namespace](https://developers.cloudflare.com/workers/learning/how-kv-works/)
bound for the `cache` and [D1 database](https://developers.cloudflare.com/d1/)
bound for the `storage`.

This **default runtime** is exposed via `@workertown/search/cloudflare-workers`.

```ts
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/cloudflare-workers";

export default search({ runtime });
```

### Built-in runtimes

The `@workertown/search` package comes with a number of built-in runtimes that
can be used to configure the service for a particular environment.

Aside from the **default** [Cloudflare Workers runtime](#the-default-runtime),
`@workertown/search` also provides a runtime for [NodeJS](https://nodejs.org/)
and a `test` runtime.

```ts
import { serve } from "@workertown/node";
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/node";

serve(search({ runtime }));
```

```ts
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/test";

export default search({ runtime });
```

### Custom runtimes

You can also create your own custom runtime by passing an `object` (or a
function that **returns** an `object`) with `cache` and `storage` properties set
to your adapters of choice.

`runtime.cache` can be *either* an instance of `CacheAdapter` **or** `false`.
Setting it to `false` **disables** caching for **all** requests.

```ts
import { search } from "@workertown/search";
import { CacheAdapter } from "@workertown/search/cache";
import { StorageAdapter } from "@workertown/search/storage";

export default search({
  runtime: {
    cache: false, // Or new CacheAdapter(...)
    storage: new StorageAdapter(/* ... */),
  },
});
```

```ts
import { search } from "@workertown/search";
import { CacheAdapter } from "@workertown/search/cache";
import { StorageAdapter } from "@workertown/search/storage";

export default search({
  runtime: (options, env) => ({
    cache: false, // Or new CacheAdapter(...)
    storage: new StorageAdapter(/* ... */),
  }),
});
```

---

## `search`

The `search` property is used to configure how search/suggestions are run via
[Minisearch](https://www.npmjs.com/package/minisearch).

By default, the `search` property is configured as follows:

```ts
import { search } from "@workertown/search";

export default search({
  search: {
    scanRange: 1000,
    stopWords: [/* ... */], // See https://gist.github.com/sebleier/554280 for the default list of stop words used
  },
});
```

### `search.boostDocument`

`search.boostDocument` is an *optional* function that can be used to boost
a given document. It receives the `document` and the matching `term` and returns
a `number` to be added to the `document`'s score to boost it.

```ts
import { search } from "@workertown/search";

export default search({
  search: {
    boostDocument: (document, term) => {
      if (term === "boosted") {
        return 1;
      }

      return 0;
    },
  },
});
```

### `search.filterDocument`

`search.filterDocument` is an *optional* function that can be used to filter
a given document. It receives the `document` and it's `result` (the search
result) and returns a `boolean` indicating whether the `document` should be
included in the results.

```ts
import { search } from "@workertown/search";

export default search({
  search: {
    filterDocument: (document, result) => {
      if (result.score < 0.2) {
        return false;
      }

      return true;
    },
  },
});
```

### `search.scanRange`

`search.scanRange` is an *optional* number that can be used to configure the
number of documents to scan out of `storage` to perform a search on. This
property can be used to tweak performance in situations where memory constraints
are affecting your search requests. By default, it is set to `1000`.

```ts
import { search } from "@workertown/search";

export default search({
  search: {
    scanRange: 100,
  },
});
```

### `search.stopWords`

`search.stopWords` is an *optional* `Set<string>` (or `string[]`) that can be a
list of words to **not** be searched on during a search/suggestion.
The default list used can be found [here](https://gist.github.com/sebleier/554280).

```ts
import { search } from "@workertown/search";

export default search({
  search: {
    stopWords: new Set(["a", "an", "the"]),
  },
});
```

---

## `sentry`

By default, Sentry is **disabled**. For details on how to configure the `sentry`
property, see [Sentry](/docs/core-concepts/configuration#sentry).
