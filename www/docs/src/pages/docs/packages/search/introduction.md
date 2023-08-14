---
title: "Introduction"
description: "@workertown/search provides production-ready text search at the edge."
---

## What is it?

`@workertown/search` provides a text search engine via a REST API - think of it
as a self-hosted Algolia or ElasticSearch... just without the front-end.

You index documents, and then you can search for them via their text content.

It is best suited for small to medium datasets, given to memory constraints
found in most edge runtime environments. Examples of what it can be used for:

- A search engine for a simple SaaS product
- A search engine for a documentation site
- A search engine for a blog

---

## Getting started

### Installation

You can install `@workertown/search` via `npm`/`yarn`/`pnpm`:

```bash
npm install @workertown/search
```

### Creating a server

In your main file (e.g. `worker.ts`), import the `search` factory function and
call it.

```ts
import { search } from "@workertown/search";

//...or `import search from "@workertown/search";`

const server = search();

//...propbably `export default server;`
```

Like all Workertown services, the created server is a [Hono](https://hono.dev)
instance with a `fetch` method.

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
  endpoints: {
    v1: {
      admin: "/admin", // Base path for the server to serve admin endpoints from
      documents: "/docs", // Base path for the server to serve documents endpoints from
      search: "/search", // Base path for the server to serve search endpoints from
      suggest: "/suggest", // Base path for the server to serve suggest endpoints from
      tags: "/tags", // Base path for the server to serve tag endpoints from
    },
    public: "/", // Base path for the server to serve public endpoints from
  },
  env: {
    cache: "SEARCH_CACHE", // Environment variable for the cache KV binding (Cloudflare Workers only)
    database: "SEARCH_DB", // Environment variable for the D1 database binding (Cloudflare Workers only)
  },
  search: {
    scanRange: 1000, // The maximum amount of records to take from storage at one time to search across
    stopWords: new Set([
      /* ... */
    ]), // Set of words to ignore when matching search results
  },
});
//...
```

---

## Concepts

### Tenants

`@workertown/search` supports multi-tenant setups, allowing you to run separate
search [indexes](#indexes) for different "tenants" (e.g. different customers,
different projects, etc). A tenant is simply identified by a unique `string`
name.

If you **do not** need multi-tenancy, you can simply use a "default" tenant.

### Indexes

All documents are stored within an index, to allow searches to be narrowed. An
index is identified by a unique `string` name.

It is **not** required to search across a single index, but it is recommended.

### Documents

A document is a single "thing" that can be indexed and searched for via some
(or all) of its text content. A document can be anything you want it to be - it
has no predefined structure.

An example document might look like this:

```json
{
  "id": "1",
  "title": "Hello, world!",
  "content": "This is a test document.",
}
```

Documents can be optionally [tagged](#tags), to allow for more fine-grained
searches.

### Tags

Tags provide a way to group documents together, to allow for more fine-grained
searches. A tag is identified by a unique `string` name.

You **do not** have to tag documents, but it is recommended.

### Searches

A search is a query that is run against a [tenant](#tenant) to find matching
[documents](#documents). A search can be run across a single [index](#indexes),
or across **all** data within a tenant. When searching, you specify which fields
within your documents to search across, allowing you to narrow down the matching
results in denormalised datasets. You can also optionally specify [tags](#tags)
to narrow the search.

Fuzzy matching, prefix matching and exact matching are all optionally supported
within a search query.

### Suggestions

A suggestion is a query that is run against a [tenant](#tenant) to find matching
terms within a dataset. A suggestion can be run across a single
[index](#indexes), or across **all** data within a tenant. When suggesting, you
specify which fields within your documents to search across, allowing you to
narrow down the matching results in denormalised datasets. You can also
optionally specify [tags](#tags) to narrow the search.

Fuzzy matching, prefix matching and exact matching are all optionally supported
within a suggestion query.

---

## How does it work?

### Search at the edge

Running a text search index on the edge is complicated - we don't have the
luxury of copious amounts of RAM to use or disk space to store indexes on
directly. `@workertown/search` manages to provide similar functionaility to a
traditional search engine by combining edge-compatible storage with the
wonderful [Minisearch](https://www.npmjs.com/package/minisearch) package.

In short, anything that is indexed is stored in an edge-compatible storage
layer (database) - when a query is run, we load the whole index into memory and
then instantiate [Minisearch](https://www.npmjs.com/package/minisearch) to
actually perform the search. This may seem wasteful when it comes to resources,
but this simple access pattern can make "hot" indexes/search terms highly
cachable.

To help keep the amount of documents loaded for a search as few as possible,
`@workertown/search` also provides a "tagging" mechanism to allow you to group
similar documents together to perform searches on.

### What are the limitations?

Because of the fact we need to load the whole index/search space into memory,
there are some limitations to be aware of when deciding whether
`@workertown/search` is right for you.

`@workertown/search` is best suited to projects where:

- The number of total documents within an index is relatively small (in the
  hundreds or thousands)
- The size of a given document is not more than a few kilobytes
- You can utilise tags to limit the number of documents that need to be loaded
  into memory

---

## The "EJECT" button

Things don't always work out.. and software doesn't always scale with your
business, or stand against the general test of time. That's OK - it's actually
a good thing (mostly)!

If you've been running `@workertown/search` in production, getting your data out
to be moved to another platform should be relatively straight forward.
Everything that is persisted data is stored in the storage layer, so getting
"at" your data is as simple as using whatever backup/dumping/querying tools that
are available for your storage of choice.

That's the beauty of how simple `@workertown/search` is - the search index
itself only ever lives in memory, and so cannot be (and doesn't need to be)
backed-up or exported directly.
