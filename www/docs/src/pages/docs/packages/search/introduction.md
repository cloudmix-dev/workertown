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

## How does it work?

### The basic concept

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

### The "EJECT" button

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
