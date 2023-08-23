---
title: "Using the API"
description: How to use the @workertown/files REST API.
---

`@workertown/files` provides simple REST API for implementing uploading,
retrieving and deleting files.

The following assumes you are using the default
[routing](/docs/core-concepts/routing) configuration. If you are using a custom
routing configuration, you will need to adjust the URL paths accordingly.

---

## Files

### Upload a file

You can upload a file (**securely**) via a `PUT` request to the
`/v1/files/:path`, where `:path` is the **unique** path of the file you are
uploading.

```bash
curl -X PUT \
  -F 'file=@path/to/test.txt' \
  https://files.example.com/v1/files/test.txt
```

`file` is the `multipart/form-data` encoded contents of the file to upload.

You can *optionally* also pass a `metadata` field with a `JSON` object as a
string representing the metadata you would like to associate with the file.

```bash
curl -X PUT \
  -F 'file=@path/to/test.txt' \
  -F 'metadata={"test": true}' \
  https://files.example.com/v1/files/test.txt
```

You will receive a `200 OK` response if the file was successfully uploaded.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "path": "test.txt",
  }
}
```

### Get a file

You can get a file as an `application/octet-stream` via a `GET` request to the
`/v1/files/:path`, where `:path` is the **unique** path of the file you are
getting.

```bash
curl -X GET \
  https://files.example.com/v1/files/test.txt
```

By **default**, this request will return the file **contents** as an
`application/octet-stream`. You can *optionally* pass a `metadata` query
parameter as either `1` or `true` for `true`, or `0` or `false` for `false`. If
`true`, then instead of the file contents you will receive the file **metadata**
as a `JSON` object.

```bash
curl -X GET \
  https://files.example.com/v1/files/test.txt?metadata=true
```

You will receive a `200 OK` response if the request is successful.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "metadata": {
      "test": true
    }
  }
}
```

### Deleting a file

You can delete a file via a `DELETE` request to the `/v1/files/:path` endpoint,
where `:path` is the **unique** path of the file you are deleting.

```bash
curl -X DELETE \
  https://files.example.com/v1/files/test.txt
```

```json
{
  "status": 200,
  "success": true,
  "data": {
   "path": "test.txt"
  }
}
```

---

## Uploads

### Create an upload URL ID

You can create a **unique** upload URL ID via a `POST` request to the
`/v1/uploads` endpoint. This can then be used to upload a file securely via the
[public upload endpoint](#upload-a-file).

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"path": "/test/file.txt"}' \
  https://files.example.com/v1/uploads
```

`path` is the **unique** path you would like to store the file at.

You can *optionally* also pass a `callbackUrl` field with a URL as a string
representing the URL you would like to be called when the upload is complete.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"path": "/test/file.txt", "callbackUrl": "https://example.com"}' \
  https://files.example.com/v1/uploads
```

You can also *optionally* pass a `metadata` field with a `JSON` object as a
string representing the metadata you would like to associate with the file.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"path": "/test/file.txt", "metadata": {"test": true}}' \
  https://files.example.com/v1/uploads
```

You will receive a `200 OK` response if the upload URL ID was successfully
created.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "id": "b6628020-e402-4e45-9102-d5cba9887010",
    "expiresAt": "2021-07-01T00:00:00.000Z",
  }
}
```

You can use the returned `id` to upload a file via the
[public upload endpoint](#upload-a-file).

---

## Admin

### Info

You can send a `GET` request to the `/v1/admin/info` endpoint to get see the
currently active configuration for your service. This is useful for debugging in
live-like environments.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://files.example.com/v1/admin/info
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
          "apiKey": "FILES_API_KEY"
        }
      },
      "basic": {
        "env": {
          "username": "FILES_USERNAME",
          "password": "FILES_PASSWORD"
        }
      },
      "jwt": {
        "env": {
          "jwksUrl": "FILES_JWKS_URL",
          "secret": "FILES_JWT_SECRET",
          "audience": "FILES_JWT_AUDIENCE",
          "issuer": "FILES_JWT_ISSUER"
        }
      },
    },
    "endpoints": {
      "v1": {
        "admin": "/v1/admin",
        "files": "/v1/files",
        "uploads": "/v1/uploads"
      },
      "public": "/"
    },
    "env": {
      "db": "FILES_DB",
      "files": "FILES_FILES",
      "signingKey": "FILES_SIGNING_KEY"
    },
    "files": {
      "uploadUrlTtl": 10 * 60
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
  https://files.example.com/v1/admin/migrate
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

### Upload a file

You can use the [upload URL ID](#create-an-upload-url-id) to upload a file
(**publicly**) via a `PUT` request to the `/v1/uploads/:id` endpoint, where
`:id` is the **unique** upload URL ID you created. This is intended for
**public** clients where you create the upload URL ID in your **secure**
environment and then issue it to the **public** client.

```bash
curl -X PUT \
  -F 'file=@path/to/test.txt' \
  https://files.example.com/v1/uploads/b6628020-e402-4e45-9102-d5cba9887010
```

`file` is the `multipart/form-data` encoded contents of the file to upload.

You will receive a `200 OK` response if the file was successfully uploaded.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "path": "test.txt",
  }
}
```

### Health

You can send a `GET` request to the `/health` endpoint to see if the service is
healthy.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://files.example.com/health
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
  https://files.example.com/open-api.json
```

You will receive a `200 OK` response if the specification was successfully
retreived.

```json
{
  "openapi": "3.0.0",
  "info": {
    "version": "1.0.0",
    "title": "Workertown Files",
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
