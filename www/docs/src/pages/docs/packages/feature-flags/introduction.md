---
title: "Introduction"
description: "@workertown/feature-flags provides production-ready feature flags, with support for runtime contexts, at the edge."
---

## What is it?

`@workertown/feature-flags` provides simple REST API for implementing a feature
flagging system, with support for runtime contexts.

You create feature flags, *optionally* with a set of **conditions** to be
evaluated at runtime against a given context, and then "ask" the API if they are
enabled/disabled.

---

## Getting started

### Installation

You can install `@workertown/feature-flags` via `npm`/`yarn`/`pnpm`:

```bash
npm install @workertown/feature-flags
```

### Creating a server

In your main file (e.g. `worker.ts`), import the `search` factory function and
call it.

```ts
import { featureFlags } from "@workertown/feature-flags";

//...or `import featureFlags from "@workertown/feature-flags";`

const server = featureFlags();

//...propbably `export default server;`
```

Like all Workertown services, the created server is a [Hono](https://hono.dev)
instance with a `fetch` method.

The `server` function accepts a single argument, an optional options object.
This options object allows you to customise the feature flags service to fit
your needs (see [configuration](/docs/packages/feature-flags/configuration) for
a full set of options).

```ts
import { featureFlags } from "@workertown/feature-flags";

// These are the default values...
const server = featureFlags({
  auth: {
    apiKey: {
      env: {
        apiKey: "FLAGS_API_KEY", // Environment variable for the API key
      },
    },
    basic: {
      env: {
        username: "FLAGS_USERNAME", // Environment variable for the admin username
        password: "FLAGS_PASSWORD", // Environment variable for the admin password
      },
    },
    jwt: {
      env: {
        jwksUrl: "FLAGS_JWKS_URL", // Environment variable for the JWKS URL
        secret: "FLAGS_JWT_SECRET", // Environment variable for the fixed JWT secret
        issuer: "FLAGS_JWT_ISSUER", // Environment variable for the JWT issuer
        audience: "FLAGS_JWT_AUDIENCE", // Environment variable for the JWT audience
      },
    },
  }, // See the "Authentication" section for all of the available options in `auth`
  basePath: "/", // Base path for the server to serve endpoints from
  endpoints: {
    v1: {
      admin: "/admin", // Base path for the server to serve admin endpoints from
      ask: "/v1/ask", // Base path for the server to process "ask" requests from
      flags: "/v1/flags", // Base path for the server to serve flags endpoints from
    },
    public: "/", // Base path for the server to serve public endpoints from
  },
  env: {
    cache: "FLAGS_CACHE", // Environment variable for the cache KV binding (Cloudflare Workers only)
    database: "FLAGS_DB", // Environment variable for the D1 database binding (Cloudflare Workers only)
  },
});
//...
```

---

## Concepts

### Flags

`@workertown/feature-flags` store flags which describe can describe a feature,
logic split, A/B test.. whatever you'd like. A flag is identified by a unique
`string` name, with an *optional* description and whether it is enabled/disabled
by default.

A flag can *optionally* have one or more
[conditions](#flag-conditions-runtime-context) attached to describe **how** it
it's enabled/disabled status should be evaluated at runtime for a given context.

An example flag looks like this:

```json
{
  "name": "test_flag",
  "description": "This is a test flag.",
  "enabled": true,
  "conditions": [
    {
      "field": "test",
      "operator": "eq",
      "value": true,
    },
  ],
}
```

### Flag conditions (runtime context)

Flag conditions are used to describe how a flag should be evaluated at runtime
for a given context. A flag can have zero or more conditions attached to it.

A condition is made up of three parts:

- `field` - The field to evaluate against in the context
- `operator` - The operator to use when evaluating the field against the value
- `value` - The value to evaluate the field against

The `field` and `value` can be any valid `JSON` value, and the `operator` can be
any of the following:

{% table %}
* Operator
* Description
* Types
---
* `neq`
* Not equals
* `string` / `number` / `boolean`
---
* `gt`
* Greater than
* `string` / `number`
---
* `gte`
* Greater than or equal to
* `string` / `number`
---
* `lt`
* Less than
* `string` / `number`
---
* `lte`
* Less than or equal to
* `string` / `number`
---
* `in`
* In
* `Array<string>` / `Array<number>` / `Array<boolean>`
---
* `nin`
* Not in
* `Array<string>` / `Array<number>` / `Array<boolean>`
{% /table %}

Any invalid conditions will be **ignored** at runtime when evaluating the flag.

An example flag conditon looks like this:

```json
{
  "field": "test",
  "operator": "eq",
  "value": true,
}
```

Any flag that is `disabled` will be ignored when evaluating the conditions and
therefore will **always** be disabled.

### Context

The context is a *optional* `JSON` `object` that is passed to the API when
performing an "ask" request. The context is used to evaluate the conditions
attached to a flag to determine whether it is enabled/disabled for the given
context.

An example context might look like this:

```json
{
  "test": true,
}
```

---

## How does it work?

### Feature flags at the edge

Running a feature flag system at the edge is actually a relatively straight
foward affair:

- Store some feature flag configurations
- Optionally cache them for performance
- Serve them from a simple REST API for evaluation

Using `@workertown/feature-flags` you can run some fairly complex scenarios for
your flags, including using them to run A/B tests and splitting logic depending
on some runtime context.

### What are the limitations?

At the edge, memory is a limited resource. This means that if you intend to have
**thousands** of feature flags running for **all** requests, then you should
probably use a dedicated platform.

---

## The "EJECT" button

Things don't always work out.. and software doesn't always scale with your
business, or stand against the general test of time. That's OK - it's actually
a good thing (mostly)!

If you've been running `@workertown/feature-flags` in production, getting your
data out to be moved to another platform should be relatively straight forward.
Everything that is persisted data is stored in the storage layer, so getting
"at" your data is as simple as using whatever backup/dumping/querying tools that
are available for your storage of choice. You then need to **replicate** how the
data describes your flags in your new system/service.
