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
3. Parse it as a `JSON` stringified value
4. Leave it as a `string`

{% callout type="warning" title="You can't use function options" %}
Given the nature of how values are passed to the underlying Workertown service,
any option that requires a function as a value is not supported via environment
variables.

If you require this level of configuration, you can use the `Dockerfile`s within
the project's repository as a template to build your own Docker image.
{% /callout %}


Aditionally, all Docker images support a `PORT` environment variable to set the
port the service will listen on (the default is `3000`).
