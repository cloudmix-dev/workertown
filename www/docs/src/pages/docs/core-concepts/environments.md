---
title: Configuration
description: Workertown services can be run in many different Javascript environments.
---

Below, you will find simple (i.e. contrived) examples of how to create and start
a Workertown service in various environments.

## Cloudflare Workers

```ts
import { search } from "@workertown/search";

export default search();
```

## Cloudflare Pages

```ts
import { serve } from "@workertown/cloudflare-pages";
import { search } from "@workertown/search";

export const onRequest = serve(search());
```

## Deno

Coming soon...

## Bun

```ts
import { search } from "@workertown/search";

const server = search();

export default {
  port: 3000,
  fetch: server.fetch,
};
```

## Fastly Compute@Edge

```ts
import { search } from "@workertown/search";

const server = search();

server.fire();
```

## Google Cloud Functions

```ts
import { search } from "@workertown/search";
import { serve } from "@workertown/google-cloud-functions";

serve(search());
```

## Google Cloud Run

```ts
import { serve } from "@workertown/node";
import { search } from "@workertown/search";

const server = search();

serve(server, {
  port: 8080,
});
```

## Lagon

```ts
import { search } from "@workertown/search";

const server = search();

export const handler = server.fetch;
```

## Vercel

```ts
import { search } from "@workertown/search";
import { serve } from "@workertown/vercel";

export default serve(search());
```

## AWS Lambda

```ts
import { serve } from "@workertown/aws-lambda";
import { search } from "@workertown/search";

export const handler = serve(search());
```

## AWS Lambda@Edge

```ts
import { serve } from "@workertown/aws-lambda-edge";
import { search } from "@workertown/search";

export const handler = serve(search());
```

## Node.js

```ts
import { serve } from "@workertown/node";
import { search } from "@workertown/search";

const server = search();

serve(server, {
  port: 3000,
});
```

