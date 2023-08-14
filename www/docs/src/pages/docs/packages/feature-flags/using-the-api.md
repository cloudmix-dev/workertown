---
title: "Using the API"
description: How to use the @workertown/feature-flags REST API.
---

`@workertown/feature-flags` provides simple REST API for implementing a feature
flagging system, with support for runtime contexts.

The following assumes you are using the default
[routing](/docs/core-concepts/routing) configuration. If you are using a custom
routing configuration, you will need to adjust the URL paths accordingly.

---

## Feature flags

### Creating a feature flag

You can create a feature flag via a `PUT` request to the `/v1/flags/:name`,
where `:name` is the **unique** name of the feature flag you are creating.

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"description": "A test flag.", "enabled": true}' \
  https://flags.example.com/v1/flags/test_flag
```

Both `description` and `enabled` are optional fields. If `enabled` is not
provided, it will default to `true`.

You can *optionally* set some runtime conditions on a feature flag by passing
a `conditions` field. This is an array of conditions that must be met for the
feature flag to be enabled.

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"description": "A test flag.", "enabled": true, "conditions": [{ "field": "test", "operator": "eq", "value": true }]}' \
  https://flags.example.com/v1/flags/test_flag
```

You will receive a `200 OK` response if the feature flag was successfully
created.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "name": "test_flag",
    "description": "A test flag.",
    "enabled": true,
    "conditions": [
      {
        "field": "test",
        "operator": "eq",
        "value": true
      }
    ],
    "createdAt": "2023-08-07T07:48:53.852Z",
    "updatedAt": "2023-08-07T07:48:53.852Z"
  }
}
```

### Getting all feature flags

You can get **all** feature flags that you have created by sending a `GET`
request to the `/v1/flags` endpoint.

```bash
curl -X GET \
  https://flags.example.com/v1/flags
```

By **default**, `disabled` flags will **not** be included in the response. If
you would like to get **all** flags, you can pass the `include_disabled` option
as either `1` or `true` for `true`, or `0` or `false` for `false`.

```bash
curl -X GET \
  https://flags.example.com/v1/flags?include_disabled=true
```

You will receive a `200 OK` response if the request is successful.

```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "name": "test_flag",
      "description": "A test flag.",
      "enabled": true,
      "conditions": [
        {
          "field": "test",
          "operator": "eq",
          "value": true
        }
      ],
      "createdAt": "2023-08-07T07:48:53.852Z",
      "updatedAt": "2023-08-07T07:48:53.852Z"
    }
  ]
}
```

### Getting a feature flag

You can get a single feature flag via a `GET` request to the `/v1/flags/:name`
endpoint, where `:name` is the **unique** name of the feature flag you are
getting.

```bash
curl -X GET \
  https://flags.example.com/v1/flags/test_flag
```

You will receive a `200 OK` response if the feature flag was successfully
retrieved.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "name": "test_flag",
    "description": "A test flag.",
    "enabled": true,
    "conditions": [
      {
        "field": "test",
        "operator": "eq",
        "value": true
      }
    ],
    "createdAt": "2023-08-07T07:48:53.852Z",
    "updatedAt": "2023-08-07T07:48:53.852Z"
  }
}
```

### Updating a feature flag

Creating/updating feature flags is performed as an "upsert", so therefore you
can update a document via the [creating](#creating-a-feature-flag) endpoint.

### Deleting a feature flag

You can delete a feature via a `DELETE` request to the `/v1/flags/:name`
endpoint, where `:id` is the **unique** name of the feature flag you are
deleting.

```bash
curl -X DELETE \
  https://flags.example.com/v1/flags/test_flag
```

You will receive a `200 OK` response if the document was successfully deleted.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "name": "test_flag",
  }
}
```

---

## Asking (checking feature flags)

You can evaluate which feature flags are enabled by sending a `POST` request to
the `/v1/ask` endpoint.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{}' \
  https://flags.example.com/v1/ask
```

By **default**, all flags will be checked for whether they are enabled or
disabled. You can *optionally* pass a `flags` array listing the **names** of the
flags you would like to check.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"flags": ["test_flag"]}' \
  https://flags.example.com/v1/ask
```

You can also *optionally* pass a `context` object, which will be used to
evaluate any runtime conditions that have been set on the feature flags.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"context": {"test": true}}' \
  https://flags.example.com/v1/ask
```

You will receive a `200 OK` response listing the **enabled** feature flags for
the request if it was successful.

```json
{
  "status": 200,
  "success": true,
  "data": [
    "test_flag"
  ]
}
```

---

## Admin

### Info

You can send a `GET` request to the `/v1/admin/info` endpoint to get see the
currently active configuration for your service. This is useful for debugging in
live-like environments.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://flags.example.com/v1/admin/info
```

You will receive a `200 OK` response if the config was successfully retrieved.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "auth": {
      "apiKey": {
        "env": {
          "apiKey": "FLAGS_API_KEY"
        }
      },
      "basic": {
        "env": {
          "username": "FLAGS_USERNAME",
          "password": "FLAGS_PASSWORD"
        }
      },
      "jwt": {
        "env": {
          "jwksUrl": "FLAGS_JWKS_URL",
          "secret": "FLAGS_JWT_SECRET",
          "audience": "FLAGS_JWT_AUDIENCE",
          "issuer": "FLAGS_JWT_ISSUER"
        }
      },
    },
    "endpoints": {
      "v1": {
        "admin": "/v1/admin",
        "ask": "/v1/ask",
        "flags": "/v1/flags"
      },
      "public": "/"
    },
    "env": {
      "cache": "FLAGS_CACHE",
      "db": "FLAGS_DB"
    }
  }
}
```

### Migrate

You can send `POST` request to the `/v1/admin/migrate` endpoint to run the
migrations required for your storage adapter to keep your database up to date.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  https://flags.example.com/v1/admin/migrate
```

You will receive a `200 OK` response if the migrations were successfully run.

```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "migrationName": "1688823193041_add_initial_tables_and_indexes",
      "direction": "Up",
      "status": "Success"
    }
  ]
}
```

If **any** errors occur durin the migration, you will receive a `500 Internal
Server Error` response, which will include the error as well as the details for
**any** successful migrations that were run. If **no** migrations were run,
`data` will be `null`.

```json
{
  "status": 500,
  "success": false,
  "data": [
    //...
  ],
  "error": "..."
}
```

---

## Public 

### Health

You can send a `GET` request to the `/health` endpoint to see if the service is
healthy.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://flags.example.com/health
```

If the service is running, you should receive a `200 OK` response.

```json
{
  "status": 200,
  "success": true,
  "data": "OK"
}
```

### Open API v3

You can send a `GET` request to the `/open-api.json` endpoint to see the OpenAPI
v3 specification for the service.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://flags.example.com/open-api.json
```

You will receive a `200 OK` response if the specification was successfully
retreived.

```json
{
  "openapi": "3.0.0",
  "info": {
    "version": "1.0.0",
    "title": "Workertown Feature Flags",
    "license": {
      "name": "MIT"
    }
  },
  "servers": [
    {
      "url": "..."
    }
  ],
  "paths": {
    //...
  },
  "components": {
    //...
  }
}
```
