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

Install the `@workertown/utils` package and call the `serve` export:

```typescript
import { search } from "@workertown/search";
import { serve } from "@workertown/utils";

serve(search());
```

The above will run a Node.js HTTP server on port `3000`.

To configure some options of the HTTP server, you can instead pass an `options`
argument instead with various options to customise the server:

```typescript
import { search } from "@workertown/search";
import { serve } from "@workertown/utils";

const api = search();

serve({
  fetch: api.fetch,
  port: 8080,
  hostname: "api.local",
});
```

The above will run a Node.js HTTP server on port `8080` and set the hostname to
`api.local`.
