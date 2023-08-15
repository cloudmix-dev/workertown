---
title: "Configuration"
description: How to configure @workertown/kv to best suite your requirements.
---

As with all Workertown services, `@workertown/kv` is highly configurable. This
page describes the various configuration options available.

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
import { kv } from "@workertown/kv";

export default kv({
  auth: {
    apiKey: {
      env: {
        apiKey: "KV_API_KEY",
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
import { kv } from "@workertown/kv";

export default kv({
  auth: {
    basic: {
      env: {
        username: "KV_USERNAME",
        password: "KV_PASSWORD",
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
import { kv } from "@workertown/kv";

export default kv({
  auth: {
    jwt: {
      env: {
        jwksUrl: "KV_JWKS_URL",
        secret: "KV_JWT_SECRET",
        audience: "KV_JWT_AUDIENCE",
        issuer: "KV_JWT_ISSUER",
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
import { kv } from "@workertown/kv";

export default kv({
  endpoints: {
    v1: {
      admin: "/v1/admin",
      kv: "/v1/kv",
    },
    public: "/",
  },
});
```

Changing these endpoints will **only** change the prefix of a particular
endpoint, **not** the entire path - e.g. setting `endpoints.v1.kv` to
`"custom-kv"` will change `/v1/kv` to `/custom-kv`.

---

## `env`

The `env` property is used to configure the various environment variables used
by the service. By default, the environment variables are configured as follows:

```ts
import { kv } from "@workertown/kv";

export default kv({
  env: {
    db: "KV_DB",
  },
});
```

While **all** the `env` property options have **predefined** uses within the
**built-in** runtimes, they can be repurposed for use with your own custom
configurations when using the [`runtime`](#runtime) property.

### `env.db`

The `env.db` property is a `string` identifying which environment variable
contains the name of the
[KV](https://developers.cloudflare.com/workers/learning/how-kv-works/)
binding for the storage, **or** a `string` identifying the file path to the
`.sqlite` database file in [NodeJS](https://nodejs.org/) environments.

---

## `logger`

By default, the logger is **enabled**. For details on how to configure the
`logger` property, see [logger](/docs/core-concepts/configuration#logger).

---

## `runtime`

The `@workertown/kv` package expects a `runtime` property that returns a
`cache` value and a `storage` value. This can *either* be an `object` with those
properties set, or a `function` that returns an `object` with those properties
set.

For more details on how runtime in WorkerTown services work, see
[runtime](/docs/core-concepts/runtime).

### The default runtime

The **default** runtime for `@workertown/kv` assumes that the service is
running in a Cloudflare Worker with a
[KV namespace](https://developers.cloudflare.com/workers/learning/how-kv-works/)
bound for the `storage`.

This **default runtime** is exposed via `@workertown/kv/cloudflare-workers`.

```ts
import { kv } from "@workertown/kv";
import { runtime } from "@workertown/kv/cloudflare-workers";

export default kv({ runtime });
```

### Built-in runtimes

The `@workertown/kv` package comes with a number of built-in runtimes that
can be used to configure the service for a particular environment.

Aside from the **default** [Cloudflare Workers runtime](#the-default-runtime),
`@workertown/kv` also provides a runtime for
[NodeJS](https://nodejs.org/) and a `test` runtime.

```ts
import { serve } from "@workertown/node";
import { kv } from "@workertown/kv";
import { runtime } from "@workertown/kv/node";

serve(kv({ runtime }));
```

```ts
import { kv } from "@workertown/kv";
import { runtime } from "@workertown/kv/test";

export default kv({ runtime });
```

### Custom runtimes

You can also create your own custom runtime by passing an `object` (or a
function that **returns** an `object`) with a `storage` property set to your
adapter of choice.

```ts
import { kv } from "@workertown/kv";
import { StorageAdapter } from "@workertown/kv/storage";

export default kv({
  runtime: {
    storage: new StorageAdapter(/* ... */),
  },
});
```

```ts
import { kv } from "@workertown/kv";
import { StorageAdapter } from "@workertown/kv/storage";

export default kv({
  runtime: (options, env) => ({
    storage: new StorageAdapter(/* ... */),
  }),
});
```

---

## `sentry`

By default, Sentry is **disabled**. For details on how to configure the `sentry`
property, see [Sentry](/docs/core-concepts/configuration#sentry).
