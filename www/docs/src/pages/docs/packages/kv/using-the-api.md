---
title: "Using the API"
description: How to use the @workertown/kv REST API.
---

`@workertown/kv` provides simple REST API to expose a simple, JSON-comptaible
key/value REST API.

The following assumes you are using the default
[routing](/docs/core-concepts/routing) configuration. If you are using a custom
routing configuration, you will need to adjust the URL paths accordingly.

---

## Values

### Setting a value

You can set a value against a key via a `PUT` request to the `/v1/kv/:key`,
where `:key` is the **unique** name of the value you are setting. `:key` can be
any URL-safe string, including `/` characters to allow for "namespacing" of
values.

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"value": "test"}' \
  https://kv.example.com/v1/kv/test/value/namespace
```

You will receive a `200 OK` response if the value was successfully set.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "value": "test"
  }
}
```

### Getting a value

You can get a value that you have set by sending a `GET` request to the
`/v1/kv/:key` endpoint, where `:key` is the **unique** name of the value you are
getting.

```bash
curl -X GET \
  https://kv.example.com/v1/kv/test/value/namespace
```

You will receive a `200 OK` response if the request is successful.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "value": "test"
  }
}
```

### Deleting a value

You can delete a value by sending a `DELETE` request to the `/v1/kv/:key`,
where `:key` is the **unique** name of the value you are deleting.

```bash
curl -X DELETE \
  https://kv.example.com/v1/kv/test/value/namespace
```

You will receive a `200 OK` response if the value was successfully deleted.

```json
{
  "status": 200,
  "success": true,
  "data": true
}
```
---

## Admin

### Info

You can send a `GET` request to the `/v1/admin/info` endpoint to get the
currently active configuration for your service. This is useful for debugging in
live-like environments.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://kv.example.com/v1/admin/info
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
          "apiKey": "KV_API_KEY"
        }
      },
      "basic": {
        "env": {
          "username": "KV_USERNAME",
          "password": "KV_PASSWORD"
        }
      },
      "jwt": {
        "env": {
          "jwksUrl": "KV_JWKS_URL",
          "secret": "KV_JWT_SECRET",
          "audience": "KV_JWT_AUDIENCE",
          "issuer": "KV_JWT_ISSUER"
        }
      },
    },
    "endpoints": {
      "v1": {
        "admin": "/v1/admin",
        "kv": "/v1/kv"
      },
      "public": "/"
    },
    "env": {
      "db": "KV_DB"
    }
  }
}
```

### Migrate

You can send a `POST` request to the `/v1/admin/migrate` endpoint to run the
migrations required for your storage adapter to keep your database up to date.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  https://kv.example.com/v1/admin/migrate
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

If **any** errors occur during the migration, you will receive a `500 Internal
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
  https://kv.example.com/health
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
  https://kv.example.com/open-api.json
```

You will receive a `200 OK` response if the specification was successfully
retrieved.

```json
{
  "openapi": "3.0.0",
  "info": {
    "version": "1.0.0",
    "title": "Workertown KV",
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
