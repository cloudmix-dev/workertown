---
title: "Getting started"
description: How to get started with @workertown/search.
---

## Installation

You can install `@workertown/search` via `npm`/`yarn`/`pnpm`:

```bash
npm install @workertown/search
```

## Creating a server

In your main file (e.g. `worker.ts`), import the `search` factory function and
call it.

```ts
import { search } from "@workertown/search";

// ...or `import search from "@workertown/search";`

const server = search();

// ...propbably `export default server;`
```

Like all Workertown services, the created server is a [Hono]() instance with a
`fetch` method.

The `server` function accepts a single argument, an optional options object.
This options object allows you to customise the search service to fit your
needs (see [configuration](/docs/packages/search/configuration) for a full set
of options).

```ts
import { search } from "@workertown/search";

// These are the default values...
const server = search({
  auth: {
    apiKey: {
      env: {
        apiKey: "SEARCH_API_KEY", // Environment variable for the API key
      },
    },
    basic: {
      env: {
        username: "SEARCH_USERNAME", // Environment variable for the admin username
        password: "SEARCH_PASSWORD", // Environment variable for the admin password
      },
    },
    jwt: {
      env: {
        jwksUrl: "SEARCH_JWKS_URL", // Environment variable for the JWKS URL
        secret: "SEARCH_JWT_SECRET", // Environment variable for the fixed JWT secret
        issuer: "SEARCH_JWT_ISSUER", // Environment variable for the JWT issuer
        audience: "SEARCH_JWT_AUDIENCE", // Environment variable for the JWT audience
      },
    },
  }, // See the "Authentication" section for all of the available options in `auth`
  basePath: "/", // Base path for the server to serve endpoints from
  env: {
    cache: "SEARCH_CACHE", // Environment variable for the cache KV binding (Cloudflare Workers only)
    database: "SEARCH_DB", // Environment variable for the D1 database binding (Cloudflare Workers only)
  },
  prefixes: {
    admin: "/v1/admin", // Base path for the server to serve admin endpoints from
    documents: "/v1/docs", // Base path for the server to serve documents endpoints from
    public: "/", // Base path for the server to serve public endpoints from
    search: "/v1/search", // Base path for the server to serve search endpoints from
    suggest: "/v1/suggest", // Base path for the server to serve suggest endpoints from
    tags: "/v1/tags", // Base path for the server to serve tag endpoints from
  },
  scanRange: 1000, // The maximum amount of records to take from storage at one time to search across
  stopWords: new Set([
    /* ... */
  ]), // Set of words to ignore when matching search results
});
// ...
```

## Running in different environments

Below, you will find simple (i.e. contrived) examples of how to create and start
a search service in various environments.

### Cloudflare Workers

```ts
import { search } from "@workertown/search";

export default search();
```

### Cloudflare Pages

Coming soon...

### Deno

Coming soon...

### Bun

```ts
import { search } from "@workertown/search";

const server = search();

export default {
  port: 3000,
  fetch: server.fetch,
};
```

### Fastly Compute@Edge

```ts
import { search } from "@workertown/search";

const server = search();

server.fire();
```

### Lagon

```ts
import { search } from "@workertown/search";

const server = search();

export const handler = server.fetch;
```

### Vercel

Coming soon...

### AWS Lambda

Coming soon...

### Node.js

```ts
import { serve } from "@workertown/node";
import { search } from "@workertown/search";

const server = search();

serve(server, {
  port: 3000,
});
```
