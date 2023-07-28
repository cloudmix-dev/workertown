---
title: Docker
description: Each Workertown service is provided as a Docker image for local/offline development
---

Every Workertown service can be run using a Docker image. This is useful for
local development, or for running services in an offline environment.

---

## The Docker images

Each service is hosted on DockerHub under the `cloudmix` organisation. The
images are named after the service they provide as
`cloudmix/workertown-<service>`, e.g. `cloudmix/workertown-search`.

### Configuring a Docker image

Any available configuration options for a service can be passed to the Docker
image via environment variables. The environment variables for configuration
are prefixed with `options_`, and delimited by `_` (underscore). They can be
nested to the depth required.

Here are some examples:

- `options_basePath=...` is equal to setting `basePath`
- `options_auth_apiKey_apiKey=...` is equal to setting `auth.apiKey.apiKey`
- `options_cors_origin=...` is equal to setting `cors.origin`

Values passed via the environment are parsed optimistically in this order:

1. Parse it as a `number`/`float`
2. Parse it as a `boolean`
3. Parse it as a `Function` string
4. Parse it as a `JSON` stringified value
5. Leave it as a `string`

{% callout type="warning" title="Be careful with function options" %}
Any available option that takes a function can be set within the environment as
a `string` representing the function.

You can write either a named/anonymous function or an ES5 arrow function:

```js
"function() { return { /* ... */ } }"
```

```js
"() => { return { /*...*/ } }"
```

```js
"() => ({ /*...*/ })"
```

Any functions parsed like this have access to a `Workertown` global object that
contains all of the runtime adapters available for the service, e.g.:

```js
"() => ({ storage: new Workertown.SqliteStorageAdapter() })"
```
{% /callout %}

Aditionally, all Docker images support a `PORT` environment variable to set the
port the service will listen on (the default is `3000`).

### Persisting data

By **default**, each Docker image will persist data using the
[Sqlite](https://www.sqlite.org/index.html) storage adapter, so that data is
persisted even when the container is stopped. By default, the Sqlite database
file is saved to `/usr/src/app/db.sqlite`, but this can be configured by either
changing the environment variable that `env.db` maps to, or by passing in a
file path in a custom `runtime` function. If the file path **does not** end with
`.sqlite`, then it will be ignored and the default path will be used.
