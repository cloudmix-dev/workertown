---
title: "Using the API"
description: How to use the @workertown/search REST API.
---

`@workertown/search` provides a text search engine via a REST API - think of it
as a self-hosted Algolia or ElasticSearch... just without the front-end.

The following assumes you are using the default
[routing](/docs/core-concepts/routing) configuration. If you are using a custom
routing configuration, you will need to adjust the URL paths accordingly.

---

## Documents

### Indexing a document

You can index a document via a `PUT` request to the `/v1/docs/:id` endpoint,
where `:id` is the **unique** ID of the document you are indexing.

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"tenant": "test-tenant", "index": "test-index", "data": {"title": "Hello world", "content": "This is a test document"}}' \
  https://search.example.com/v1/docs/1
```

You **must** provide a `tenant` and `index` property in the request body - if
you do **not** intend to search/siggest across multiple tenants/indexes, you can
use a "default" value for both and use it in all requests.

`data` can be any `JSON` object you want - it has no predefined structure. **Any**
`string` fields on the object will be accessible via [searches](#searching) and
[suggestions](#suggestions), although you can (and *should*) narrow that down
when performing a [search](#searching)/[suggestion](#suggestions).

You can *optionally* tag a document by providing a `tags` property on the
request body, which is an array of `string` values.

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -d '{"tenant": "test-tenant", "index": "test-index", "data": {"title": "Hello world", "content": "This is a test document"}, "tags": ["test", "other"]}' \
  https://search.example.com/v1/docs/1
```

You will receive a `200 OK` response if the document was successfully indexed.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "id": "1",
    "tenant": "test-tenant",
    "index": "test-index",
    "data": {
      "title": "Hello world",
      "content": "This is a test document"
    },
    "tags": ["test", "other"],
    "createdAt": "2023-08-06T18:35:22.471Z",
    "updatedAt": "2023-08-06T18:51:32.428Z"
  }
}
```

### Getting a document

You can get a document via a `GET` request to the `/v1/docs/:id` endpoint, where
`:id` is the **unique** ID of the document you are getting.

```bash
curl -X GET \
  https://search.example.com/v1/docs/1
```

You will receive a `200 OK` response if the document was successfully retrieved.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "id": "1",
    "tenant": "test-tenant",
    "index": "test-index",
    "data": {
      "title": "Hello world",
      "content": "This is a test document"
    },
    "tags": ["test", "other"],
    "createdAt": "2023-08-06T18:35:22.471Z",
    "updatedAt": "2023-08-06T18:51:32.428Z"
  }
}
```

### Updating a document

Indexing a documents is performed as an "upsert", so therefore you can update a
document via the [indexing](#indexing-a-document) endpoint.

### Deleting a document

You can delete a document via a `DELETE` request to the `/v1/docs/:id` endpoint,
where `:id` is the **unique** ID of the document you are deleting.

```bash
curl -X DELETE \
  https://search.example.com/v1/docs/1
```

You will receive a `200 OK` response if the document was successfully deleted.

```json
{
  "status": 200,
  "success": true,
  "data": {
    "id": "1",
  }
}
```

---

## Searching

You can search for documents via a `GET` request to the
`/v1/search/:tenant/:index` endpoint, where `:tenant` is the name of the tenant
you are searching within, and `:index` is the name of the index you are
searching within.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://search.example.com/v1/search/test-tenant/test-index?term=test&field=content
```

`index` is optional, and if omitted the search will be performed over **all** of
the tenants indexes. You **must** provide a `term` query parameter in the
request URL, which is the search term you are searching for.

You will receive a `200 OK` response if the search was successful.

```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "id": "1",
      "document": {
        "id": "1",
        "tenant": "test-tenant",
        "index": "test-index",
        "data": {
          "title": "Hello world",
          "content": "This is a test document"
        },
        "tags": [
          "test"
        ],
        "createdAt": "2023-08-06T18:35:22.471Z",
        "updatedAt": "2023-08-06T18:51:32.428Z"
      },
      "score": 0.4315231086776713,
      "terms": [
        "test"
      ],
      "match": {
        "test": [
          "content"
        ]
      }
    }
  ],
  "pagination": {
    "hasNextPage": false,
    "endCursor": "MQ=="
  }
}
```

`score` is the relevancy score of the document, and `terms` is an array of the
terms that matched the document. `match` is an object of the terms that matched
the document, and the fields that matched the term.

### Fuzzy search

You can *optionally* set fuzzy matching on the search by providing a `fuzzy`
query parameter in the request URL, which is a `float` value, e.g. `0.5`. If
the `fuzzy` parameter is not provided, fuzzy matching is **disabled** by
default.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://search.example.com/v1/search/test-tenant/test-index?term=test&field=content&fuzzy=0.5
```

### Prefix search

You can *optionally* set prefix matching on the search by providing a `prefix`
query parameter in the request URL, which is a `boolean` value indicated by `1`
or `true` for **on**, or `0` or `false` for **off**. If the `prefix` parameter
is not provided, prefix matching is **disabled** by default.

Prefix matching will ensure that the search term is matched at the **start** of
the field value(s).

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://search.example.com/v1/search/test-tenant/test-index?term=test&field=content&prefix=1
```

### Exact search

You can *optionally* set exact matching on the search by providing a `exact`
query parameter in the request URL, which is a `boolean` value indicated by `1`
or `true` for **on**, or `0` or `false` for **off**. If the `exact` parameter
is not provided, exact matching is **disabled** by default.

Exact matching will ensure that the search term is matched **exactly** to the
field value(s).

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://search.example.com/v1/search/test-tenant/test-index?term=test&field=content&exact=1
```

### Pagination

You can *optionally* set a limit to the number of results to be returned by a 
search with the `limit` query parameter. The default limit is `100`.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  https://search.example.com/v1/search/test-tenant/test-index?term=test&field=content&limit=10
```

A successful response will contain a `pagination` object, which contains
`hasNextPage` and `endCursor` properties. `hasNextPage` is a `boolean` value
indicating if there are more results to be returned, and `endCursor` is a
unique cursoe to use in subsequent search requests using the `after` query
parameter.

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  https://search.example.com/v1/search/test-tenant/test-index?term=test&field=content&limit=10&after=MQ==
```

---

## Suggestions

You can get suggestions for a search term via a `GET` request to the
`/v1/suggest/:tenant/:index` endpoint, where `:tenant` is the name of the tenant
you are searching within, and `:index` is the name of the index you are
searching within.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://search.example.com/v1/suggest/test-tenant/test-index?term=test&field=content
```

`index` is optional, and if omitted the suggestions will be performed over
**all** of the tenants indexes. You **must** provide a `term` query parameter in
the request URL, which is the search term you are searching for.

You will receive a `200 OK` response if the suggestions were successful.

```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "suggestion": "test",
      "terms": [
        "test"
      ],
      "score": 0.4315231086776713
    }
  ]
}
```

`suggestion` is the suggested term, `terms` is an array of the terms that
matched the suggestion, and `score` is the relevancy score of the suggestion.

### Fuzzy suggestions

Suggestions can fuzzy matched in the same way as [search](#fuzzy-search).

### Prefix suggestions

Suggestions can prefix matched in the same way as [search](#prefix-search).

### Exact suggestions

Suggestions can exact matched in the same way as [search](#exact-search).

---

## Tags

### Get tags

You can see a list of tags registered to your documents via a `GET` request to
the `/v1/tags` endpoint.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://search.example.com/v1/tags
```

You will receive a `200 OK` response if the tags were successfully retrieved.

```json
{
  "status": 200,
  "success": true,
  "data": [
    "test"
  ]
}
```

This endppoint will return tags across **all** tenants/indexes, so is only
intended for overall tag "management". If you would like to power tag
**suggestion** interfaces, you can place a `_tags` field on your
[document](#documents) as a space-delimited string of the tags for the document,
and then perform a [suggestion](#suggestions) request against the `_tags` field.

---

## Admin

### Info

You can send a `GET` request to the `/v1/admin/info` endpoint to get see the
currently active configuration for your service. This is useful for debugging in
live-like environments.

```bash
curl -X GET \
  -H "Content-Type: application/json" \
  https://search.example.com/v1/admin/info
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
          "apiKey": "SEARCH_API_KEY"
        }
      },
      "basic": {
        "env": {
          "username": "SEARCH_USERNAME",
          "password": "SEARCH_PASSWORD"
        }
      },
      "jwt": {
        "env": {
          "jwksUrl": "SEARCH_JWKS_URL",
          "secret": "SEARCH_JWT_SECRET",
          "audience": "SEARCH_JWT_AUDIENCE",
          "issuer": "SEARCH_JWT_ISSUER"
        }
      }
    },
    "endpoints": {
      "v1": {
        "admin": "/v1/admin",
        "documents": "/v1/docs",
        "search": "/v1/search",
        "suggest": "/v1/suggest",
        "tags": "/v1/tags"
      },
      "public": "/"
    },
    "env": {
      "cache": "SEARCH_CACHE",
      "db": "SEARCH_DB"
    },
    "search": {
      "scanRange": 1000,
      "stopWords": [
          //...
      ]
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
  https://search.example.com/v1/admin/migrate
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
  https://search.example.com/health
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
  https://search.example.com/open-api.json
```

You will receive a `200 OK` response if the specification was successfully
retreived.

```json
{
  "openapi": "3.0.0",
  "info": {
    "version": "1.0.0",
    "title": "Workertown Search",
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
