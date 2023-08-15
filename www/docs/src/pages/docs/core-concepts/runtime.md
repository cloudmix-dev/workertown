---
title: Runtime
description: Each Workertown package supports customisation of its runtime behaviour depending on the environment.
---

All Workertown services expose the ability to customise their runtime behaviour
depending on the environment they are running in - this is a powerful
configuration that ensures that the service can run essentially **anywhere**.

---

## How it works

Each Workertown service exposes a `runtime` option that can be passed when
created that takes either an `object` exposing the required shape of that
service's runtime **or** a function that **returns** an object exposing the
required shape of that service's runtime.

```ts
import { search, type RuntimeResolver } from "@workertown/search";

export default search({
  runtime: {
    // Options go here...
  } as RuntimeResolver,
});
```
```ts
import { search, type RuntimeResolver } from "@workertown/search";

const runtime: RuntimeResolver = () => ({
  // Options go here...
});

export default search({ runtime });
```

{% callout title="Check the docs!" %}
Each Workertown service has a different set of required values to satisfy their
`RuntimeResolver` type.

Read the docs for the service you're using to see what options are available.
{% /callout %}

---

## Built-in runtimes

Each Workertown service has a set of built-in runtimes that can be used to
quickly get up and running in a specific environment.

### Cloudflare Workers

The `cloudflare-workers` runtime is the **default** runtime for all Workertown
services, and so any Workertown service that **does not** specify a `runtime`
will use this by default. This runtime requires
[D1](https://developers.cloudflare.com/d1/) for storage, and *optionally*
[KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) for the
cache (where caching is supported).

Each Workertown package exposes a Cloudflare Workers `runtime` that can be used
when creating the service.

```ts
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/cloudflare-workers";

export default search({ runtime });
```

The `cloudflare-workers` runtime will attempt to retrieve the necessary
[KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) and
[D1](https://developers.cloudflare.com/d1/) bindings from the environment based
on the `env.cache` and `env.db` values in the service's `options`, e.g. if
`env.cache` is set to `MY_CACHE` then the runtime will attempt to retrieve the
[KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) binding
from `env.MY_CACHE`.

### Edge

The `edge` runtime is a runtime that can be used to run Workertown services
within edge (WinterCG compatible) environment. This environment will use
[Planetscale](https://planetscale.com/) for storage and
[Upstash Redis](https://docs.upstash.com/redis) for the cache (where caching is
supported).

Each Workertown package exposes an edge `runtime` that can be used when creating
the service.

```ts
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/edge";

export default search({ runtime });
```

The `edge` runtime will attempt to retrieve the necessary
[Planetscale](https://planetscale.com/) and
[Upstash Redis](https://docs.upstash.com/redis) options from the environment,
based on the `env.db` and `env.cache` values in the service's `options`, e.g. if
`env.db` is set to `MY_DB` then the runtime will attempt to retrieve the
[Planetscale](https://planetscale.com/) URL from `env.MY_DB`.

The [Planetscale](https://planetscale.com/) URL should be set in the environment
in the format `mysql://<USERNAME>:<PASSWORD>@<URL>`, where `USERNAME` and
`PASSWORD` are your database credentials.

The [Upstash Redis](https://docs.upstash.com/redis) URL should be set in the
environment in the format `https://<TOKEN>@<URL>`, where `TOKEN` is your
authentication token.

### NodeJS

The `nodejs` runtime is a runtime that can be used to run Workertown services
within a NodeJS environment. This environment will use 
[Sqlite](https://www.sqlite.org/index.html) for storage, and an in-memory cache
for the cache (where caching is supported).

Each Workertown package exposes a NodeJS `runtime` that can be used when
creating the service.

```ts
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/node"

export default search({ runtime });
```

The `nodejs` runtime will attempt to retrieve the
[Sqlite](https://www.sqlite.org/index.html) file path from the environment based
on the `env.db` value in the service's `options`, e.g. if `env.db` is set to
`MY_DB` then the runtime will attempt to load/create the database file at the
value set in `process.env.MY_DB` (**as long as** it ends in `.sqlite`).

### Test runtime

The `test` runtime is a runtime that can be used to run Workertown services
when developing and testing locally. It is **not** intended to be used in
production, as it will store any data in **memory** which will only live for the
lifetime of the process the service runs in.

Each Workertown package exposes a test `runtime` that can be used when creating
the service.

```ts
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/test"

export default search({ runtime });
```

---

## Environments

Below, you will find simple (i.e. contrived) examples of how to create and start
a Workertown service in various environments.

### AWS Lambda

```ts
import { serve } from "@workertown/aws-lambda";
import { search } from "@workertown/search";

export const handler = serve(search());
```

### AWS Lambda@Edge

```ts
import { serve } from "@workertown/aws-lambda-edge";
import { search } from "@workertown/search";

export const handler = serve(search());
```

### Bun

```ts
import { search } from "@workertown/search";

const server = search();

export default {
  port: 3000,
  fetch: server.fetch,
};
```

### Cloudflare Workers

```ts
import { search } from "@workertown/search";

export default search();
```

### Cloudflare Pages

```ts
import { serve } from "@workertown/cloudflare-pages";
import { search } from "@workertown/search";

export const onRequest = serve(search());
```

### Fastly Compute@Edge

```ts
import { search } from "@workertown/search";

const server = search();

server.fire();
```

### Google Cloud Functions

```ts
import { search } from "@workertown/search";
import { serve } from "@workertown/google-cloud-functions";

serve(search());
```

### Google Cloud Run

```ts
import { serve } from "@workertown/node";
import { search } from "@workertown/search";

const server = search();

serve(server, {
  port: 8080,
});
```

### Lagon

```ts
import { search } from "@workertown/search";

const server = search();

export const handler = server.fetch;
```

### Node.js

```ts
import { serve } from "@workertown/node";
import { search } from "@workertown/search";

const server = search();

serve(server, {
  port: 3000,
});
```

### Vercel

```ts
import { search } from "@workertown/search";
import { serve } from "@workertown/vercel";

export default serve(search());
```
