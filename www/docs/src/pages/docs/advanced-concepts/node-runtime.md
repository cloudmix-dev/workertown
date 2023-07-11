---
title: Node runtime
description: Workertown services can be used within the Node.js runtime too.
---

While Workertown is designed to work with edge runtimes, you can also run your
services within the Node.js runtime. This can be useful for testing and
development purposes, but also in situations where you deployment platform of
choice uses Node.js.

---

## Usage

Install the `@workertown/node` package and call the `serve` export:

```typescript
import { serve } from "@workertown/node";
import { search } from "@workertown/search";

serve(search());

console.log("Server running at http://localhost:3000");
```

The above will run a Node.js HTTP server on port `3000`.

To configure some options of the HTTP server, you can also pass an `options`
argument with various options to customise the server:

```typescript
import { serve } from "@workertown/node";
import { search } from "@workertown/search";

const api = search();

serve(api, { port: 8080, hostname: "api.local" });

console.log("Server running at http://localhost:8080");
```

The above will run a Node.js HTTP server on port `8080` and set the hostname to
`api.local`.

{% callout type="warning" title="You'll need to set some options" %}
The Workertown packages all come with a default config that assumes the service
is running in a (correctly configured) Cloudflare Workers environment.

When running in Node.js, you'll need to change your storage and cache adapters
to ones that work in Node.js. Every package comes with a [Planetscale]() storage
adapter and an [Upstash Redis]() cache adapter, but you can also write your own.
{% /callout %}
