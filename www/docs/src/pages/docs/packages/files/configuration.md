---
title: "Configuration"
description: How to configure @workertown/files to best suite your requirements.
---

As with all Workertown services, `@workertown/files` is highly
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
import { files } from "@workertown/files";

export default files({
  auth: {
    apiKey: {
      env: {
        apiKey: "FILES_API_KEY",
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
import { files } from "@workertown/files";

export default files({
  auth: {
    basic: {
      env: {
        username: "FILES_USERNAME",
        password: "FILES_PASSWORD",
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
import { files } from "@workertown/files";

export default files({
  auth: {
    jwt: {
      env: {
        jwksUrl: "FILES_JWKS_URL",
        secret: "FILES_JWT_SECRET",
        audience: "FILES_JWT_AUDIENCE",
        issuer: "FILES_JWT_ISSUER",
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
import { files } from "@workertown/files";

export default files({
  endpoints: {
    v1: {
      admin: "/v1/admin",
      files: "/v1/files",
      uploads: "/v1/uploads",
    },
    public: "/",
  },
});
```

Changing these endpoints will **only** change the prefix of a particular
endpoint, **not** the entire path - e.g. setting `endpoints.v1.files` to
`"custom-files"` will change `/v1/files` to `/custom-files`.

---

## `env`

The `env` property is used to configure the various environment variables used
by the service. By default, the environment variables are configured as follows:

```ts
import { files } from "@workertown/files";

export default files({
  env: {
    db: "FILES_DB",
    files: "FILES_FILES",
  },
});
```

While **all** the `env` property options have **predefined** uses within the
**built-in** runtimes, they can be repurposed for use with your own custom
configurations when using the [`runtime`](#runtime) property.

### `env.files`

The `env.files` property is a `string` identifying which environment variable
contains the name of the [R2 Bucket](https://developers.cloudflare.com/r2/)
for the file storage.

### `env.db`

The `env.db` property is a `string` identifying which environment variable
contains the name of the [D1 database](https://developers.cloudflare.com/d1/)
binding for the storage, **or** a `string` identifying the file path to the
`.sqlite` database file in [NodeJS](https://nodejs.org/) environments.

---

## `files`

The `files` options is used to configure the file storage options.

By default, the `files` property is configured as follows:

```ts
import { files } from "@workertown/files";

export default files({
  files: {
    uploadUrlTtl: 10 * 60, // The time-to-live for upload URL IDs in seconds
  },
});
```

### `files.uploadUrlTtl`

The `files.uploadUrlTtl` property is a `number` representing the time-to-live
for upload URL IDs in seconds. By default, this is set to **10 minutes**.

---

## `logger`

By default, the logger is **enabled**. For details on how to configure the
`logger` property, see [logger](/docs/core-concepts/configuration#logger).

---

## `runtime`

The `@workertown/files` package expects a `runtime` property that returns a
`files` value and a `storage` value. This can *either* be an `object` with those
properties set, or a `function` that returns an `object` with those properties
set.

For more details on how runtime in WorkerTown services work, see
[runtime](/docs/core-concepts/runtime).

### The default runtime

The **default** runtime for `@workertown/files` assumes that the service is
running in a Cloudflare Worker with a
[KV namespace](https://developers.cloudflare.com/workers/learning/how-kv-works/)
bound for the `files` and [D1 database](https://developers.cloudflare.com/d1/)
bound for the `storage`.

This **default runtime** is exposed via `@workertown/files/cloudflare-workers`.

```ts
import { files } from "@workertown/files";
import { runtime } from "@workertown/files/cloudflare-workers";

export default files({ runtime });
```

### Built-in runtimes

The `@workertown/files` package comes with a number of built-in runtimes that
can be used to configure the service for a particular environment.

Aside from the **default** [Cloudflare Workers runtime](#the-default-runtime),
`@workertown/files` also provides a runtime for
[NodeJS](https://nodejs.org/) and a `test` runtime.

```ts
import { serve } from "@workertown/node";
import { files } from "@workertown/files";
import { runtime } from "@workertown/files/node";

serve(files({ runtime }));
```

```ts
import { files } from "@workertown/files";
import { runtime } from "@workertown/files/test";

export default files({ runtime });
```

### Custom runtimes

You can also create your own custom runtime by passing an `object` (or a
function that **returns** an `object`) with `files` and `storage` properties set
to your adapters of choice.

```ts
import { files } from "@workertown/files";
import { FilesAdapter } from "@workertown/files/files";
import { StorageAdapter } from "@workertown/files/storage";

export default files({
  runtime: {
    files: new FilesAdapter(/* ... */),
    storage: new StorageAdapter(/* ... */),
  },
});
```

```ts
import { files } from "@workertown/files";
import { FilesAdapter } from "@workertown/files/files";
import { StorageAdapter } from "@workertown/files/storage";

export default files({
  runtime: (options, env) => ({
    files: new FilesAdapter(/* ... */),
    storage: new StorageAdapter(/* ... */),
  }),
});
```

---

## `sentry`

By default, Sentry is **disabled**. For details on how to configure the `sentry`
property, see [Sentry](/docs/core-concepts/configuration#sentry).
