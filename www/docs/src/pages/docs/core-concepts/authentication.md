---
title: Authentication
description: Each Workertown package supports various authentication options to secure your API.
---

Workertown's aim to provide production-ready services for edge deployments
extends to good security best practices. Each service can be configured to be
secured using any combination of available strategies.

A Workertown service will check an incoming request against **all** enabled
authentication strategies, and will fail the request if **none** of the
strategies successfully authenticates the request. This allows you to mix and
match strategies on a per request basis.

---

## JWT

JWT authentication is the **recommended** authentication strategy for use in
production, as it is the only strategy that doesn't require _fixed_ credentials.

With JWT authentication enabled, by default your services will look for a signed
JWT passed as a `Bearer` token as part of the `Authorization` header:

```bash
Authorization: Bearer <JWT>
```

You can configure your service to check the signature of the JWT using either a
fixed secret you provide it, or via a JWKS URL.

{% callout type="warning" title="You really should be using JWKS" %}
Fixed secrets are very rarely a good idea in production environments, as they
can be leaked and involve resetting service runtime values to remove.

JWKS allow you to point your service to an external server you trust, meaning
none of your secure credentials/keys are stored on your service directly!
{% /callout %}

### Configuration

Each Workertown package comes with JWT **enabled** by default. JWT
authentication will assume (unless told otherwise) that the values it needs to
verify a JWT are set in the environment, but this can be configured via the
`options` object you can pass to `auth.jwt` in your service's options:

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    jwt: {
      audience: "http://api.acme.com", // Optional JWT audience value to verify
      env: {
        jwksUrl: "SEARCH_JWKS_URL", // Environment variable for the JWKS URL
        secret: "SEARCH_JWT_SECRET", // Environment variable for the fixed JWT secret
        issuer: "SEARCH_JWT_ISSUER", // Environment variable for the JWT issuer
        audience: "SEARCH_JWT_AUDIENCE", // Environment variable for the JWT audience
      }, // Each service has it's own `auth.jwt.env` default values, so check the docs for more info.
      issuer: "http://acme.com", // Optional JWT issuer value to verify
      jwks: {
        url: "https://auth.acme.com/.well-known/jwks.json", // Optional JWKS URL
        cacheTtl: 84600, // Optional number of seconds to cache the JWKS for
      },
      secret: "super_secret_jwts", // Fixed secret to verify JWTs with
    },
  },
});
```

### Getting the JWT from the request

By default, Workertown services will look for the JWT in the `Authorization`
header, specifically as a `Bearer` token. This can be changed by passing a
`getCredentials` function that takes the request and returns the JWT as a
`string` (or `undefined`/`null`).

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    jwt: {
      getCredentials: (req) => {
        const url = new URL(req.url);

        return url.searchParams.get("token");
      }
    },
  },
});
```

### Verifying the JWT payload

You can verify any custom claims set within the JWT payload by passing a 
`verifyCredentials` function to the `auth.jwt` options. This function receives
the JWT payload as a single argument and returns a `boolean` (or a
`Promise<boolean>`) indicating whether the JWT is valid or not.

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    jwt: {
      verifyCredentials: (jwt) => {
        return jwt.role === "admin";
      }
    },
  },
});
```

### JWKS caching

When running in the Cloudflare Workers runtime (for now - this will be rolling
out to all runtimes eventually...), fetches made to load and check for a valid
JWKS are cached for `86400` seconds by default on a **successful** response.

If you would like to change this value, this can be set via the
`auth.jwt.jwksCacheTtl` option, where you can set the number of **seconds** to
cache the JWKS for. It can also be disabled entirely by setting this option to
`false`.

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    jwt: {
      jwks:{ 
        cacheTtl: 3600, // or false
      },
    },
  },
});
```

---

## API key

API key authentication authenticates requests via an API key.

With API key authentication enabled, by default your services will look for a
key passed as a `Bearer` token as part of the `Authorization` header:

```bash
Authorization: Bearer <API key>
```

### Configuration

Each Workertown package comes with the API key strategy **enabled** by default.
API key authentication will assume (unless told otherwise) that the values it
needs to verify a request are set in the environment, but this can be configured
via the `options` object you can pass to `auth.apiKey` in your service's
options:

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    apiKey: {
      apiKey: "super_secret_api", // Fixed API key to verify requests with
      env: {
        apiKey: "SEARCH_API_KEY" // Environment variable for the fixed API key
      }; // Each service has it's own `auth.apiKey.env` default values, so check the docs for more info.
    }
  },
});
```

### Getting the API key from the request

By default, Workertown services will look for the API key in the `Authorization`
header, specifically as a `Bearer` token. This can be changed by passing a
`getCredentials` function that takes the request and returns the API key as a
`string` (or `undefined`/`null`).

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    apiKey: {
      getCredentials: (req) => {
        const url = new URL(req.url);

        return url.searchParams.get("api_key");
      }
    },
  },
});
```

### Verifying the API key

You can manually verify the API key on a per request basis by passing a
`verifyCredentials` function to the `auth.apiKey` options. This function
receives the API key as a single argument and returns a `boolean` (or a
`Promise<boolean>`) indicating whether the API key is valid or not.

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    apiKey: {
      verifyCredentials: (apiKey) => {
        return apiKey === "super_secret_api";
      }
    },
  },
});
```

---

## Basic (username/password)

Basic authentication authenticates requests via a username/password combination.

With basic authentication enabled, by default your services will look for a
base64 encoded `username:password` passed as a `Basic` credential as part of the
`Authorization` header:

```bash
Authorization: Basic base64(<username>:<password>)
```

### Configuration

Each Workertown package comes with the basic strategy **enabled** by default.
Basic authentication will assume (unless told otherwise) that the values it
needs to verify a request are set in the environment, but this can be configured
via the `options` object you can pass to `auth.basic` in your service's
options:

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    basic: {
      username: "username", // Fixed username to verify requests with
      password: "password", // Fixed password to verify requests with
      env: {
        username: "SEARCH_USERNAME" // Environment variable for the fixed username
        password: "SEARCH_PASSWORD" // Environment variable for the fixed password
      }; // Each service has it's own `auth.basic.env` default values, so check the docs for more info.
    }
  },
});
```

### Getting the username and password from the request

By default, Workertown services will look for the username and password in the
`Authorization` header, specifically as a base64 encoded `Basic` credential.
This can be changed by passing a `getCredentials` function that takes the
request and returns the username/password combination as a `[string,string]`
tuple (or `undefined`/`null`).

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    basic: {
      getCredentials: (req) => {
        const url = new URL(req.url);

        return [url.username, url.password];
      }
    },
  },
});
```

### Verifying the username and password

You can manually verify the username and password on a per request basis by
passing a `verifyCredentials` function to the `auth.basic` options. This
function receives the username and password as `string` arguments, and returns
a `boolean` (or a `Promise<boolean>`) indicating whether the username/password
combination is valid or not.

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    basic: {
      verifyCredentials: (username, password) => {
        return username === "username" && password === "password";
      }
    },
  },
});
```

---

## Manually authenticating per request

Every Workertown service supports an `authenticateRequest` function that can be
passed within the `auth` argument when creating the service. This function
returns a `User` object or `null` (or a `Promise<User | null>`) where a `User`
is an `object` with an `id` property that identifies the user. It runs **after**
the authentication middlewares listed above.

Here is an example:

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    authenticateRequest: async (req, user) => {
      // `req` is the incoming `Request` object
      // `user` is the already authenticated `User` object (or `null`)

      return user?.id === "123" ? user : null;
    },
  },
});
```

The incoming `user` object (if not `null`) has an `id` property, and a strategy
property that is one of `jwt`, `api-key`, or `basic`, identifying which strategy
was used to authenticate the user. If the user was authenticated with the `jwt`
strategy, the `user` object will also contain a `claims` property containing all
of the JWT's claims.

___

## Disabling authentication

To disable any authentication strategy, simply set the `auth.<strategy>` option
to `false`.

```ts
import { search } from "@workertown/search";

export default search({
  auth: {
    basic: false,
  },
});
```
{% callout type="warning" title="Do not disable all strategies" %}
The internals of Workertown services require an authenticated user to be present
within the context of a request to function. While you can set each
`auth.<strategy>` to `false` without setting an `authenticateRequest` function,
this isn't advised as you won't be able to call any of the service's non-public
endpoints.
{% /callout %}
