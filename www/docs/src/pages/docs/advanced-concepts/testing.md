---
title: Testing
description: Workertown provides some simple utilities to help you test your services.
---

All Workertown services are tested end-to-end using within our codebase,
including many combinations of configuration options. However, sometimes you
need the piece of mind that your service will fucntion as intended **exactly**
as you have it in production.

## Testing

In these examples, our test framework of choice will be
[Ava](https://github.com/avajs/ava), but you can use any test framework you like
to test your Workertown services.

Given a service that looks like this:

```ts
// index.ts
import { search } from "@workertown/search";

export default search();
```

...we can test it like this using the `@workertonw/utils` package:

```ts
// index.test.ts
import test from "ava";
import { request } from "@workertown/utils/test";
import server from "./server";

test("it works", (t) => {
  const res = await request(server, "/health");

  t.is(res.status, 200);
});
```

## Passing in a test runtime

Obviously, we don't always want to have to test a server with a full
production-like runtime. Perhaps we just want to test that our server exposes
the correct endpoints based on the `basePath` or `endpoints` option, or that it
correctly has CORS enabled. For those instances, you can slightly modify how you
construct your server to make use of the provided `test` runtime:

```ts
// server.ts
import { search, type CreateServerOptions } from "@workertown/search";

export function createServer(options?: CreateServerOptions) {
  return search({
    ...options,
    endpoints: {
      public: "/public",
    },
  });
}
```

```ts
// index.ts
import { createServer } from "./server";

export default createServer();
```

```ts
// server.test.ts
import test from "ava";
import { runtime } from "@workertown/search/test";
import { request } from "@workertown/utils/test";
import { createServer } from "./server";

test("it works", (t) => {
  const server = createServer({ runtime });
  const res = await request(server, "/public/health");

  t.is(res.status, 200);
});
```
