# @workertown/search

Provides an out of the box search API for the Cloudflare Workers environment,
powered by [Workers KV](), [D1]() and [Minisearch]().

- [@workertown/search](#workertownsearch)
  - [Getting started](#getting-started)
    - [Database migrations](#database-migrations)
  - [Using the search API](#using-the-search-api)
  - [Customising the search API](#customising-the-search-api)
    - [Authentication](#authentication)
    - [Endpoints](#endpoints)
    - [Cache](#cache)
  - [Limitations](#limitations)

## Getting started

The `@workertown/search` package is desgigned to be a drop in solution. A full
working example can be implemented with just two file changes in a Cloudflare
Workers project (using Wrangler).

`index.{js,ts}`:

```ts
import { search } from "@workertown/search";

export default search();
```

`wrangler.toml`:

```toml
[env]
SEARCH_API_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[kv_namespaces]]
binding = "CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[d1_databases]]
binding = "DB"
database_name = "search"
database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

This creates the default search API with a static API key for authentication.

Many of the runtime configuration options available can be set in your
`wrangler.toml` file. If you wanted to, for example, use JWT authentication
instead, you could set the following:

```toml
[env]
SEARCH_JWKS_URL = "https://example.com/.well-known/jwks.json"
# OR
SEARCH_JWT_SECRET = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

This will authenticate requests to the search API using a JWT token, either
using the `SEARCH_JWKS_URL` endpoint or `SEARCH_JWT_SECRET` value to validate
it.

If you _don't_ want to have a cache layer, you can disable it by removing the
`CACHE` binding from your `wrangler.toml` file.

It really is that simple!

### Database migrations

The `@workertown/search` package provides the required [D1]() migrations
required to run the API. You will need to copy these migration files from the
installed package into your project repository:

```sh
cp ./node_modules/@workertown/search/migrations/* migrations/
```

See the [D1 migrations]() documentation for more information.

## Using the search API

## Customising the search API

With the `@workertown/search` package, you can customise the search API to suit
your specific needs/requirements. Nearly every aspect of the API can be changed
via the `search()` function:

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    apiKey: {
      apiKey: "super_secret_api_key", // Hard code the API key
      env: {
        apiKey: "CUSTOM_API_KEY_ENV", // Set where in the `env` object the API key is stored
      },
    },
    basic: {
      username: "admin@example.com", // Hard code the username
      password: "!Pa$$w0rd", // Hard code the password
      env: {
        username: "CUSTOM_USERNAME_ENV", // Set where in the `env` object the username is stored
        password: "CUSTOM_PASSWORD_ENV", // Set where in the `env` object the password is stored
      }
    },
    jwt: {
      jwksUrl: "https://example.com/.well-known/jwks.json", // Hard code the JWKS URL
      secret: "super_secret_jwts", // Hard code the JWT secret
      issuer: "https://example.com", // Hard code the JWT issuer
      audience: "https://example.com", // Hard code the JWT audience
      env: {
        jwksUrl: "CUSTOM_JWKS_URL_ENV", // Set where in the `env` object the JWKS URL is stored
        secret: "CUSTOM_JWT_SECRET_ENV", // Set where in the `env` object the JWT secret is stored
        issuer: "CUSTOM_JWT_ISSUER_ENV", // Set where in the `env` object the JWT issuer is stored
        audience: "CUSTOM_JWT_AUDIENCE_ENV", // Set where in the `env` object the JWT audience is stored
        cache: "CUSTOM_CACHE_ENV", // Set where in the `env` object the JWKS cache key is stored
      },
      cache: {
        key: "custom_jwks_cache_key", // Hard code the JWKS cache key
      },
    },
  },
  endpoints: {
    search: "/custom/search/:tenant?/:index?", // Custom search endpoint
    getItem: "/custom/search/:tenant/:index/:id", // Custom get item endpoint
    indexItem: "/custom/search/:tenant/:index/:id", // Custom index item endpoint
    deleteItem: "/custom/search/:tenant/:index/:id", // Custom delete item endpoint
    openApi: "/custom/search/openapi.json", // Custom OpenAPI spec endpoint
  },
  env: {
    database: "CUSTOM_DB_BINDING", // Set where in the `env` object the D1 binding is stored
  };
});
```

Any option that has a corresponding `env` property can be set in your
`wrangler.toml` file instead using the default bindings:

```toml
[env]
SEARCH_API_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

SEARCH_JWT_AUDIENCE = "https://example.com"
SEARCH_JWT_ISSUER = "https://example.com"
SEARCH_JWT_SECRET = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SEARCH_JWKS_URL = "https://example.com/.well-known/jwks.json"

SEARCH_PASSWORD = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SEARCH_USERNAME = "admin@example.com"
```

_Any_ **hard coded** values provided in the `search()` function will override
the values set in your `wrangler.toml` file.

### Authentication

### Endpoints

### Cache

## Limitations

The basic principal of the search API is storing the indexed items in a [D1]()
database, and then loading the **entire** search index for the request into
memory to perform the search via [Minisearch](). While this is a performant, and
compatible with the Cloudflare Workers runtime, it does have some limitations.

Given the limitations of the Cloudflare Workers runtime, a worker cannot exceed
128MB of memory - while the `@workertown/search` package is production-ready, it
is **not** suitable for large scale searches across 100MB+ datasets. We
recommend that requests to the `search` endpoint are as **narrow** as possible,
to avoid loading large amounts of data into memory. Tags are a great way to
narrow a search, and we recommend using them where possible.

It is also recommended that you enable the cache layer, as this will reduce the
number of requests to the D1 database, and potentially reduce the amount of data
that needs to be loaded into memory at all for common search queries.
