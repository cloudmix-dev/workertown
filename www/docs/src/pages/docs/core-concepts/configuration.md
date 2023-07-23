---
title: Configuration
description: Workertown adheres to a principal we call "sensible defaults, absolute configuration".
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
your service. Currently, it has a single property, `access.ip`, which allows you
to specify an array of IP addresses/CIDR blocks that are allowed to access your
service.

This is **disabled** by default, meaning that your service can be accessed from
**any** IP address.

```ts
import { search } from "@workertown/search";

export default search({
  access: {
    ip: ["10.0.0.0", "11.0.0.0/24"],
  },
});
```

The values passed in to the `access.ip` array can either be an IPv4 string, or
an IPv4 CIDR block describing an IP range to allow.

Any requests that do not originate from an IP address whutelisted in the
`access.ip` array will be rejected with a `403 Forbidden` response.

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
