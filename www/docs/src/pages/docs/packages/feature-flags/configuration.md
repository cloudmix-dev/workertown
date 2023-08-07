---
title: "Configuration"
description: How to configure @workertown/feature-flags to best suite your requirements.
---

As with all Workertown services, `@workertown/feature-flags` is highly
configurable. This page describes the various configuration options available.

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
import { featureFlags } from "@workertown/feature-flags";

export default featureFlags({
  auth: {
    apiKey: {
      env: {
        apiKey: "FLAGS_API_KEY",
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
import { featureFlags } from "@workertown/feature-flags";

export default featureFlags({
  auth: {
    basic: {
      env: {
        username: "FLAGS_USERNAME",
        password: "FLAGS_PASSWORD",
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
import { featureFlags } from "@workertown/feature-flags";

export default featureFlags({
  auth: {
    jwt: {
      env: {
        jwksUrl: "FLAGS_JWKS_URL",
        secret: "FLAGS_JWT_SECRET",
        audience: "FLAGS_JWT_AUDIENCE",
        issuer: "FLAGS_JWT_ISSUER",
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
import { featureFlags } from "@workertown/feature-flags";

export default featureFlags({
  endpoints: {
    v1: {
      admin: "/v1/admin",
      ask: "/v1/ask",
      flags: "/v1/flags",
    },
    public: "/",
  },
});
```

Changing these endpoints will **only** change the prefix of a particular
endpoint, **not** the entire path - e.g. setting `endpoints.v1.flags` to
`"custom-flags"` will change `/v1/flags` to `/custom-flags`.

---

## `env`

The `env` property is used to configure the various environment variables used
by the service. By default, the environment variables are configured as follows:

```ts
import { featureFlags } from "@workertown/feature-flags";

export default featureFlags({
  env: {
    cache: "FLAGS_CACHE",
    db: "FLAGS_DB",
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

The `@workertown/feature-flags` package expects a `runtime` property that returns a
`cache` value and a `storage` value. This can *either* be an `object` with those
properties set, or a `function` that returns an `object` with those properties
set.

For more details on how runtime in WorkerTown services work, see
[runtime](/docs/core-concepts/runtime).

### The default runtime

The **default** runtime for `@workertown/feature-flags` assumes that the service is
running in a Cloudflare Worker with a
[KV namespace](https://developers.cloudflare.com/workers/learning/how-kv-works/)
bound for the `cache` and [D1 database](https://developers.cloudflare.com/d1/)
bound for the `storage`.

This **default runtime** is exposed via `@workertown/feature-flags/cloudflare-workers`.

```ts
import { featureFlags } from "@workertown/feature-flags";
import { runtime } from "@workertown/feature-flags/cloudflare-workers";

export default featureFlags({ runtime });
```

### Built-in runtimes

The `@workertown/feature-flags` package comes with a number of built-in runtimes that
can be used to configure the service for a particular environment.

Aside from the **default** [Cloudflare Workers runtime](#the-default-runtime),
`@workertown/feature-flags` also provides a runtime for
[NodeJS](https://nodejs.org/) and a `test` runtime.

```ts
import { serve } from "@workertown/node";
import { featureFlags } from "@workertown/feature-flags";
import { runtime } from "@workertown/feature-flags/node";

serve(featureFlags({ runtime }));
```

```ts
import { featureFlags } from "@workertown/feature-flags";
import { runtime } from "@workertown/feature-flags/test";

export default featureFlags({ runtime });
```

### Custom runtimes

You can also create your own custom runtime by passing an `object` (or a
function that **returns** an `object`) with `cache` and `storage` properties set
to your adapters of choice.

`runtime.cache` can be *either* an instance of `CacheAdapter` **or** `false`.
Setting it to `false` **diables** caching for **all** requests.

```ts
import { featureFlags } from "@workertown/feature-flags";
import { CacheAdapter } from "@workertown/feature-flags/cache";
import { StorageAdapter } from "@workertown/feature-flags/storage";

export default featureFlags({
  runtime: {
    cache: false, // Or new CacheAdapter(...)
    storage: new StorageAdapter(/* ... */),
  },
});
```

```ts
import { featureFlags } from "@workertown/feature-flags";
import { CacheAdapter } from "@workertown/feature-flags/cache";
import { StorageAdapter } from "@workertown/feature-flags/storage";

export default featureFlags({
  runtime: (options, env) => ({
    cache: false, // Or new CacheAdapter(...)
    storage: new StorageAdapter(/* ... */),
  }),
});
```

---

## `sentry`

By default, Sentry is **disabled**. For details on how to configure the `sentry`
property, see [Sentry](/docs/core-concepts/configuration#sentry).
