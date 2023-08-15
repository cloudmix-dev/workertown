---
title: "Introduction"
description: "@workertown/kv provides production-ready feature flags, with support for runtime contexts, at the edge."
---

## What is it?

`@workertown/kvs` provides simple REST API for exposing a JSON compatible
key/value store.

Think of it like
[Cloudflare Workers KV](https://developers.cloudflare.com/workers/learning/how-kv-works/)
over HTTP.

---

## Getting started

### Installation

You can install `@workertown/kv` via `npm`/`yarn`/`pnpm`:

```bash
npm install @workertown/kv
```

### Creating a server

In your main file (e.g. `worker.ts`), import the `kv` factory function and call
it.

```ts
import { kv } from "@workertown/kv";

//...or `import kv from "@workertown/kv";`

const server = kv();

//...propbably `export default server;`
```

Like all Workertown services, the created server is a [Hono](https://hono.dev)
instance with a `fetch` method.

The `server` function accepts a single argument, an optional options object.
This options object allows you to customise the feature flags service to fit
your needs (see [configuration](/docs/packages/kv/configuration) for
a full set of options).

```ts
import { kv } from "@workertown/kv";

// These are the default values...
const server = kv({
  auth: {
    apiKey: {
      env: {
        apiKey: "KV_API_KEY", // Environment variable for the API key
      },
    },
    basic: {
      env: {
        username: "KV_USERNAME", // Environment variable for the admin username
        password: "KV_PASSWORD", // Environment variable for the admin password
      },
    },
    jwt: {
      env: {
        jwksUrl: "KV_JWKS_URL", // Environment variable for the JWKS URL
        secret: "KV_JWT_SECRET", // Environment variable for the fixed JWT secret
        issuer: "KV_JWT_ISSUER", // Environment variable for the JWT issuer
        audience: "KV_JWT_AUDIENCE", // Environment variable for the JWT audience
      },
    },
  }, // See the "Authentication" section for all of the available options in `auth`
  basePath: "/", // Base path for the server to serve endpoints from
  endpoints: {
    v1: {
      admin: "/admin", // Base path for the server to serve admin endpoints from
      kv: "/v1/kv", // Base path for the server to process KV requests from
    },
    public: "/", // Base path for the server to serve public endpoints from
  },
  env: {
    database: "KV_DB", // Environment variable for the KV database binding (Cloudflare Workers only)
  },
});
//...
```

---

## Concepts

### Values

A `value` is a JSON compatible value that is stored in the key/value store. It
is serialised and deserialised using `JSON.stringify` and `JSON.parse`
respectively when it is stored/retrieved.

A `value` has a `key`. A `key` is **any** string, and uniquely identifies
**one** `value` in storage.

A value can have a `ttl`, which is the amount of time (in **seconds**) that the
`value` should be stored for. If a `ttl` is not provided, then the value will
exist indefinitely.

---

## How does it work?

### KV at the edge

Running a kv system at the edge is actually a relatively straight foward affair:

- Store a value as a JSON with a unique key
- Get the value via it's key and parse the JSON

`@workertown/kv` is designed to be a *fast* and *reliable* solution to storing
little-written but often-read values that your services rely on.

### What are the limitations?

For this use case, the edge is not really limited - as long as you are storing
values that are of a "sensible" (less than `25MB`) size, `@workertown/kv` is a
great solution for exposing KV via REST.

---

## The "EJECT" button

Things don't always work out.. and software doesn't always scale with your
business, or stand against the general test of time. That's OK - it's actually
a good thing (mostly)!

If you've been running `@workertown/kv` in production, getting your
data out to be moved to another platform should be relatively straight forward.
Everything that is persisted data is stored in the storage layer, so getting
"at" your data is as simple as using whatever backup/dumping/querying tools that
are available for your storage of choice. You then need to **replicate** how the
data describes your keys/values in your new system/service.
