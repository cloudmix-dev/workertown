---
title: "@workertown/search"
description: Production-ready text search at the edge
---

## What is it?

`@workertown/search` provides a text search engine via a REST API - think of it
as a self-hosted Algolia or ElasticSearch... just without the front-end.

You index documents, and then you can search for them via their text content.

Examples of what it can be used for:

- A search engine for a blog
- A search engine for a documentation site
- A search engine for a simple SaaS product

---

## Getting started

### Installation

You can install `@workertown/search` via `npm`:

```bash
npm install @workertown/search
```

### Creating a server

In your main file (e.g. `worker.ts`), import the `search` factory function and
call it.

```typescript
import { search } from "@workertown/search";
// ...or...
import search from "@workertown/search";

const server = search();
// ...
```

Like all Workertown services, the created server is a [Hono]() instance with a
`fetch` method.

The `server` function accepts a single argument, an optional options object.
This options object allows you to customise the search service to fit your
needs.

```typescript
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
    items: "/v1/items", // Base path for the server to serve items endpoints from
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

### Configuration

---

## Using the API

### Indexing a document

#### Tags

### Searching for documents

#### Tags

### Suggesting documents

#### Tags

### Admin

---

## Docker

### Running the Docker container

---

## How does it work?

### The basic concept

Running a text search index on the edge is complicated - we don't have the
luxury of copious amounts of RAM to use or disk space to store indexes on
directly. `@workertown/search` manages to provide similar functionaility to a
traditional search engine by combining edge-compatible storage with the
wonderful [Minisearch]() package.

In summary, anything that is indexed is stored in an edge-compatible storage
layer - when a query is run, we load the whole index into memory and then
instantiate [Minisearch]() to actually perform the search. This may seem
wasteful when it comes to resources, but this simple access pattern can make
"hot" indexes/search terms highly cachable.

To help keep the amount of documents loaded for a search as few as possible,
`@workertown/search` also provides a "tagging" mechanism to allow you to group
similar documents together to perform searches on.

### What are the limitations?

Because of the fact we need to load the whole index/search space into memory,
there are some limitations to be aware of when deciding whether
`@workertown/search` is right for you.

`@workertown/search` is best suited to projects where:

- The number of total documents within an index is small (in the hundreds or
  thousands)
- The size of a given document is not more than a few kilobytes
- You can utilise tags to limit the number of documents that need to be loaded
  into memory

## The "EJECT" button

Things don't always work out.. and software doesn't always scale with your
business, or stand against the general test of time. That's OK - it's actually
a good thing (mostly)!

If you've been running `@workertown/search` in production, getting your data out
to be moved to another platform should be relatively straight forward.
Everything that is persisted data is stored in the storage layer, so getting
"at" your data is as simple as using whatever backup/dumping/querying tools that
are available for your storage of choice.

That's the beauty of how simple `@workertown/search` - the search index itself
only ever lives in memory, and so cannot be backed-up or exported directly.
