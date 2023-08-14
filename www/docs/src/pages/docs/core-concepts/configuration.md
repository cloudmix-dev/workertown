---
title: Configuration
description: Workertown adheres to a principal we call "sensible defaults, advanced configuration".
---

Sensible defaults, absolute configuration. That statement is at the core of our
design decisions when it comes to Workertown.

We feel very strongly that creating a Workertown service should be as simple as
importing and calling a function - however, we all know that the real world can
be far more complex than that.

---

## Setting configuration options

In each Workertown package, every aspect of how your service functions is
exposed via an optional `options` argument. This is how you configure a
Workertown service to best suite your needs.

```ts
import { search } from "@workertown/search";

export default search({
  // Options go here...
})
```

---

## Universal options

All Workertown services have a common set of options that are available to be
set when creating the service.

### `access`

The `access` object allows you to configure access level protections for
your service. Currently, it has a two properties, `access.ip` and
`access.rateLimit`

#### `access.ip`

`acces.ip` allows you to specify an array of IP addresses/CIDR blocks that are
allowed to access your service.

This is **disabled** by default, meaning that your service can be accessed from
**any** IP address.

```ts
import { search } from "@workertown/search";

export default search({
  access: {
    ip: [
      "10.0.0.0",
      "11.0.0.0/24",
      "2001:4860:8006::62",
      "2001:db8::/24",
    ],
  },
});
```

The values passed in to the `access.ip` array can either be an IPv4/v6 string,
or an IPv4/v6 CIDR block describing an IP range to allow.

Any requests that do not originate from an IP address whutelisted in the
`access.ip` array will be rejected with a `403 Forbidden` response.

#### `access.rateLimit`

`access.rateLimit` allows you to specify a rate limit for your service. By
default, this is powered by
[Cloudflare Workers KV](https://developers.cloudflare.com/workers/learning/how-kv-works/),
but can be configured to use the built in
[Upstash Redis](https://docs.upstash.com/redis) rate limiter or a custom rate
limiter class. Requests are limited by their **IP address** in a
**sliding window** of time.

This is **disabled** by default, meaning that your service can be accessed from
an IP address with **no** rate limiting.

```ts
import { search } from "@workertown/search";

export default search({
  access: {
    rateLimit: {
      env: {
        kv: "RATE_LIMIT_KV", // The environment variable to read the KV binding from
      },
      limit: 10, // The maximum number of requests to allow in the window
      window: 60, // The window (in seconds) to allow the requests in
    }
  },
});
```

```ts
import { search } from "@workertown/search";
import { UpstashRedisRateLimiter } from "@workertown/search/rate-limit/upstash-redis";

export default search({
  access: {
    rateLimit: {
      rateLimiter: new UpstashRedisRateLimiter({
        url: "...",
        token: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      }),
    }
  },
});
```

```ts
import { search } from "@workertown/search";
import { RateLimiter } from "@workertown/search/rate-limit";

class CustomRateLimiter extends RateLimiter {
  //...
}

export default search({
  access: {
    rateLimit: {
      rateLimiter: new CustomRateLimiter(),
    }
  },
});
```

### `auth`

See the [Authentication](/docs/core-concepts/authentication) documentation.

### `basePath`

The `basePath` property allows you to specify a base path for your service's
API. By default this is set to `/`, meaning that your service will be
available from the root of your service's domain.

```ts
import { search } from "@workertown/search";

export default search({
  basePath: "/search", // The API will be exposed from `/search/*`
});
```

### `cors`

If you would like to expose any Workertown service to a web-based front-end
client, you will likely need to enable CORS.

By default, CORS is **disabled**. To enable it, simply set the `cors` property.

```ts
import { search } from "@workertown/search";

export default search({
  cors: {
    origin: "https://example.com", // The origin to allow requests from
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // The HTTP methods to allow
    allowHeaders: ["Content-Type", "Authorization"], // The HTTP headers to allow
    maxAge: 86400, // The maximum age (in seconds) to cache preflight requests
    credentials: true, // Whether or not to allow credentials (cookies, etc)
    exposeHeaders: ["Content-Length"], // The HTTP headers to expose
  }
});
```

The `cors.origin` property can be a string, an array of strings, or a function
that is passed the origin of the incoming request and returns the  allowed CORS
origin as a `string` (or `undefined`/`null` if the origin is not allowed).

```ts
import { search } from "@workertown/search";

export default search({
  cors: {
    origin: (origin) => {
      if (origin === "https://example.com") {
        return origin;
      }
    },
  },
});
```

### `endpoints`

To see how the `endpoints` option works in general, see
[routing](/docs/core-concepts/routing).

### `getEnv`

By default, a Workertown service will read environment variables from either the
`env` argument passed to the service function (in Cloudflare Workers), or from
`process.env`.

You can customise this behaviour by passing in a `getEnv` function that takes
whatever has been parsed from the environment as an `env` `object` argument and
returns an `object` of environment variables. This will **override** any
environment variables set via `env`/`provess.env`, so ensure to include any
variables you need from the passed in `env` `object`.

```ts
import { search } from "@workertown/search";

export default search({
  getEnv: (env) => ({
    ...env,
    db: "SEARCH_DB",
  }),
});
```

### `logger`

By default, all Workertown services log to `console.log` in the format:

```bash
<METHOD> <URL PATH> <STATUS CODE> <RESPONSE TIME>ms
```

This logger functionality can be customised by passing in a `logger` function
that takes the `method`, URL `path`, `status`, and `elapsed` time as arguments
that returns `void` or `Promise<void>`.

```ts
import { search } from "@workertown/search";

export defult search({
  logger: (method: string, path: string, status: number, elapsed: string) => {
    console.log(status, method, path, elapsed);
  },
});
```

It can be **disabled** entirely by passing in `false` instead.

```ts
import { search } from "@workertown/search";

export defult search({
  logger: false,
});
```

### `runtime`

All Workertown services expose the ability to customise the runtime options to
allow support for different environments. By default, every Workertown package
assumes it is running within a **Cloudflare Worker** (and therefore makes some
assumptions about bindings that are available).

Workertown comes with **three** out-of-the-box runtimes:

- `cloudflare-workers`
- `node`
- `test`

They are all pretty self explanatory - it goes without saying that the `test`
runtime is **only** intended to be used in test environments, and is **not**
suitable for production.

While the available runtime options differ between services, customising them
follows the same simple API.

```ts
import { serve } from "@workertown/node";
import { search } from "@workertown/search";
import { runtime } from "@workertown/search/node";

serve(search({ runtime }));

console.log("Server running at http://localhost:3000");
```

The `runtime` option accepts either an `object` (in the shape of the expected
runtime - this differs between packages) or a `function` that returns the
expected runtime. The `function` option receives two arguments, the `options`
set for the service and an `env` object that contains the environment
variables/bindings available within the environment (the `env` object in a
Cloudflare Worker, ot the `process.env` object in Node, for example).

```ts
import { serve } from "@workertown/node";
import { search } from "@workertown/search";
import { SqliteStorageAdapter } from "@workertown/search/storage/sqlite";

serve(
  search({
    runtime: (options, env) => ({
      cache: false,
      storage: new SqliteStorageAdapter({
        db: config.env.db,
      }),
    })
  })
);

console.log("Server running at http://localhost:3000");
```

{% callout title="Check the docs!" %}
Be sure to check the documentation for the particular service you are using to
see what runtime options are available.
{% /callout %}

### `sentry`

All Workertown service support Sentry error reporting at the edge (via
[Toucan.js](https://github.com/robertcepa/toucan-js)). This is **disabled** by
default - to enable Sentry error reporting, simply set the `sentry` property.

```ts
import { search } from "@workertown/search";

export default search({
  sentry: {
    dsn: "xxxxxxxxxxxxxxxxxxxx", // Your Sentry DSN
    allowedCookies: ["__session"], // The cookies to allow
    allowedSearchParams: ["q"], // The search params to allow
    attachStacktrace: true, // Whether or not to attach a stacktrace to errors
    debug: true, // Whether or not to enable debug mode
    environment: "production", // The environment to report errors as
    maxBreadcrumbs: 100, // The maximum number of breadcrumbs to report
    pkg: {
      name: "search", // The name of your service
      version: "1.0.0", // The version of your service
    }, // The package.json values of your service
    release: "1.0.0", // The release version of your service
  },
});
```
