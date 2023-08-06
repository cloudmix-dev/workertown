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
will use this by default.

Each Workertown package exposes a Cloudflare Workers `runtime` that can be used
when creating the service.

```ts
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/cloudflare-workers";

export default search({ runtime });
```

### NodeJS

The `nodejs` runtime is a runtime that can be used to run Workertown services
within a NodeJS environment.

Each Workertown package exposes a NodeJS `runtime` that can be used when
creating the service.

```ts
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/node"

export default search({ runtime });
```

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
