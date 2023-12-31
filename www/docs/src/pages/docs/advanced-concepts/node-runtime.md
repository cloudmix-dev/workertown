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

```ts
import { serve } from "@workertown/node";
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/node";

serve(search({ runtime }));

console.log("Server running at http://localhost:3000");
```

The above will run a Node.js HTTP server on port `3000`.

To configure some options of the HTTP server, you can also pass an `options`
argument with various options to customise the server:

```ts
import { serve } from "@workertown/node";
import { runtime } from "@workertown/search/node";

serve(search({ runtime }));

serve(search({ runtime }), { port: 8080, hostname: "api.local" });

console.log("Server running at http://localhost:8080");
```

The above will run a Node.js HTTP server on port `8080` and set the hostname to
`api.local`.

---

## Utilities

### `exitOnSignals`

The `exitOnSignals` utility function can be used to exit the process when a
signal is received. By default, it will listen for the `SIGINT` and `SIGTERM`
signals and exit the process with a `1` exit code.

```ts
import { serve } from "@workertown/node";
import { exitOnSignals } from "@workertown/node/utils";
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/node";

exitOnSignals();
serve(search({ runtime }));

console.log("Server running at http://localhost:3000");
```

You can customise the `signals` to listen for, as well as the exit `code` and
the `on` and `exit` listeners to register to:

```ts
import { serve } from "@workertown/node";
import { exitOnSignals } from "@workertown/node/utils";
import { runtime } from "@workertown/search/node";

function customOn(event: string | symbol, listener: (...args: any[]) => void) {
  console.log(`Adding listener for signal ${event}`);
  process.on(signal, listener);
}

function customExit(code: number = 99) {
  console.log(`Exiting with code ${code}`);
  process.exit(code);
}

exitOnSignals(["SIGMADEUP"], { code: 99, exit: customExit, on: customOn });
serve(search({ runtime }));

console.log("Server running at http://localhost:3000");
```


### `parseOptionsFromEnv`

The `parseOptionsFromEnv` utility function can be used to parse options from
environment variables set within the runtime. By default, it will look at
`process.env` for any values starting with `options_` and attempt to parse the
value as such:

1. Parse it as a `number`/`float`
2. Parse it as a `boolean`
3. Parse it as a `JSON` stringified value
4. Leave it as a `string`

Nested options are supported by using `_` (underscore) as a delimiter, e.g.
`options_auth_basic_username` is equal to `auth.basic.username`.

```ts
import { serve } from "@workertown/node";
import { parseOptionsFromEnv } from "@workertown/node/utils";
import { runtime } from "@workertown/search/node";

serve(search({ runtime }));
serve(search({ ...parseOptionsFromEnv(), runtime }));

console.log("Server running at http://localhost:3000");
```

You can explicitly pass in the `env` object to parse values from, and both the
`prefix` and the `delimiter` can be customised via an optional `options`
argument:

```ts
import { serve } from "@workertown/node";
import { parseOptionsFromEnv } from "@workertown/node/utils";
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/node";

serve(
  search({
    ...parseOptionsFromEnv(
      process.env,
      {
        prefix: "search_options",
        delimiter: ">",
      },
    ), // e.g. search_options>auth>basic>username
    runtime,
  }),
);

console.log("Server running at http://localhost:3000");
```
