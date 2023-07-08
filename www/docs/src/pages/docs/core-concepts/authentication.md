---
title: Authentication
description: Each Workertown package supports various authentication options to secure your API.
---

Workertown's aim to provide production-ready services for edge deployments
extends to good security best practices. Each service can be configured to be
secured using any combination of available strategies.

---

## JWT

JWT authentication is the **recommended** authentication strategy for use in
production, as it is the only strategy that doesn't require _fixed_ credentials.

With JWT authentication enabled, your services will look for a signed JWT passed
as a `Bearer` token as part of the `Authorization` header:

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

```typescript
import { search } from "@workertown/search";

export default search({
  auth: {
    jwt: {
      jwksUrl: "https://auth.acme.com/.well-known/jwks.json", // JWKS URL
      jwksCacheTtl: 86400, // How long to cache JWKS for (Cloudflare Workers only, for now...)
      secret: "super_secret_jwts", // Fixed secret to verify JWTs with
      issuer: "http://acme.com", // Optional JWT issuer value to verify
      audience: "http://api.acme.com", // Optional JWT audience value to verify
      claims: {
        "http://acme.com/some-claim": true,
      }, // Optional extra JWT claims to check for (matches the exact value)
      env: {
        jwksUrl: "SEARCH_AUTH_JWKS_URL", // Environment variable for the JWKS URL
        secret: "SEARCH_AUTH_JWT_SECRET", // Environment variable for the fixed JWT secret
        issuer: "SEARCH_AUTH_JWT_ISSUER", // Environment variable for the JWT issuer
        audience: "SEARCH_AUTH_JWT_AUDIENCE", // Environment variable for the JWT audience
      }, // Each service has it's own `auth.jwt.env` default values, so check the docs for more info.
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

```typescript
import { search } from "@workertown/search";

export default search({
  auth: {
    jwt: {
      jwksCacheTtl: 3600, // or false
    },
  },
});
```

---

## API key

---

## Basic (username/password)
