---
title: "Introduction"
description: "@workertown/files provides production-ready file storage at the edge."
---

## What is it?

`@workertown/files` provides simple REST API for implementing a file storage
system, with support for "signed" public uploads.

You store a file (blob of data) at a path, and can then retrieve it / update it 
/ delete it from said path.

---

## Getting started

### Installation

You can install `@workertown/files` via `npm`/`yarn`/`pnpm`:

```bash
npm install @workertown/files
```

### Creating a server

In your main file (e.g. `worker.ts`), import the `files` factory function
and call it.

```ts
import { files } from "@workertown/files";

//...or `import files from "@workertown/files";`

const server = files();

//...propbably `export default server;`
```

Like all Workertown services, the created server is a [Hono](https://hono.dev)
instance with a `fetch` method.

The `server` function accepts a single argument, an optional options object.
This options object allows you to customise the files service to fit your needs
(see [configuration](/docs/packages/files/configuration) for a full set of
options).

```ts
import { files } from "@workertown/files";

// These are the default values...
const server = files({
  auth: {
    apiKey: {
      env: {
        apiKey: "FILES_API_KEY", // Environment variable for the API key
      },
    },
    basic: {
      env: {
        username: "FILES_USERNAME", // Environment variable for the admin username
        password: "FILES_PASSWORD", // Environment variable for the admin password
      },
    },
    jwt: {
      env: {
        jwksUrl: "FILES_JWKS_URL", // Environment variable for the JWKS URL
        secret: "FILES_JWT_SECRET", // Environment variable for the fixed JWT secret
        issuer: "FILES_JWT_ISSUER", // Environment variable for the JWT issuer
        audience: "FILES_JWT_AUDIENCE", // Environment variable for the JWT audience
      },
    },
  }, // See the "Authentication" section for all of the available options in `auth`
  basePath: "/", // Base path for the server to serve endpoints from
  endpoints: {
    v1: {
      admin: "/admin", // Base path for the server to serve admin endpoints from
      files: "/v1/files", // Base path for the server to serve files endpoints from
      uploads: "/v1/uploads", // Base path for the server to serve uploads endpoints from
    },
    public: "/", // Base path for the server to serve public endpoints from
  },
  env: {
    cache: "FILES_CACHE", // Environment variable for the cache KV binding (Cloudflare Workers only)
    database: "FILES_DB", // Environment variable for the D1 database binding (Cloudflare Workers only)
    files: "FILES_FILES" // Environment variable for the R2 binding (Cloudflare Workers only)
  },
});
//...
```

---

## Concepts

### Files

`@workertown/files` stores files against a unique path via a **secure** REST
API, with *optional* support to allow **public** uploads. A file is essentially
any blob of data.

### Uploads

An upload is a unique identifier for an upload operation that you can create in
your **secure** server environment and then issue to a **public** client to
allow public uploads. 

An upload is identified by an `id` (a unique `string` identifier), and contains
a `path` (the path to store the file at), and *optionally* a `callbackUrl`
(the URL to call when the upload is complete) and `metadata` (any
additional `JSON` data you want to be associated with the file).

Here is an example of an upload represented in `JSON`:

```json
{
  "id": "b6628020-e402-4e45-9102-d5cba9887010",
  "path": "/test/file.txt",
  "callbackUrl": "https://example.com",
  "metadata": {
    "test": true
  }
}
```

On a successful upload, is there is a `callbackUrl`, it will be called with a
`POST` request with the body of the request being the `JSON` representation of
the upload (as above).

To verify that the upload is valid, the `callbackUrl` will be signed with an
`X-Workertown-Signature` header that contains an **HMAC** of the upload's `JSON`
representation, using a configurable **secret** (see
[configuration](/docs/packages/files/configuration) for more details).

Here is some example code to verify the signature in Typescript:

```ts
const secret = "<SOME SECRET>";
const encoder = new TextEncoder();
const key = await crypto.subtle.importKey(
  "raw",
  encoder.encode(secret),
  "HMAC",
  false,
  ["verify"],
);
const valid = await crypto.subtle.verify(
  "HMAC",
  key,
  encoder.encode("<`X-Workertown-Signature` HEADER VALUE>"),
  encoder.encode(JSON.stringify({ /* ...upload JSON */ })),
);
```

---

## How does it work?

### File storage at the edge

`@workertown/files` is a REST API abstraction on top of your existing object
storage solution. It provides a simple interface for storing files at a path,
and retrieving them. As most object storage solutions are **already** designed
to be HTTP compatible (and therefore edge compatible), `@workertown/files` aims
to simplify the *interface* to your file storage.

### What are the limitations?

At the edge, memory is a limited resource. The files you upload are buffered
into memory fully before upload - this means that if you intend to have files
larger than **120MB** or so in size, you should consider using your object
storage solution directly, and not via `@workertown/files`.

---

## The "EJECT" button

Things don't always work out.. and software doesn't always scale with your
business, or stand against the general test of time. That's OK - it's actually
a good thing (mostly)!

If you've been running `@workertown/files` in production, there isn't much to do
after you've deleted your files service - your files are stored directly in your
object storage of choice, and therefore they have no direct dependency on
`@workertown/files`.
