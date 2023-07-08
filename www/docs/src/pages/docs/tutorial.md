---
title: Tutorial
description: A simple tutorial to get you started with Workertown, using the search package.
---

The following tutorial is a simple, step-by-step example of how to create a
Workertown search service, deployed to production on Cloudflare Workers.

---

## Setup the project

### `wrangler init`

First, let's create a new `wrangler` project:

```bash
npx wrangler init
```

This should prompt you with some questions around what setup you would like.
Name it what you like and make sure to select the `"Hello World" script` option
when prompted. We'd also recommend you select `Yes` for `Typescript`.

Now you should have a project with this structure:

```bash
src
  ├── worker.{js,ts}
package.json
wrangler.toml
# ... other files too probably...
```

### Install `@workertown/search`

Now, you can install the `@workertown/search` package:

```bash
npm install @workertown/search
```

---

## The default service

All Workertown packages adhere to our "simple defaults, powerful customisation"
principal. This means that you cna get a production-reasy service running
without **any** extra code.

The `@workertown/search` package is no different.

### Create the service

To create the service, first replace the contents of `worker.{js.ts}` with the
following:

```typescript
import { search } from "@workertown/search";

export default search();
```

That's all it takes in terms of code to get a production-ready search service
up!

However, to run it correctly locally (and on Cloudflare Workers), we need to
add some values to the `wrangler.toml` file.

Add the following to the `wrangler.toml` file:

```c
[vars]
SEARCH_API_KEY = "super_secret_api"

[[kv_namespaces]]
binding = "SEARCH_CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[d1_databases]]
binding = "SEARCH_DB"
database_name = "search_example"
database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Now, don't be too worried about that **hard coded** API key, or the `"xxx..."`
values... we'll fix that before we get to production...

### Run the service locally

OK, now it's time to run the service.

Make sure your `package.json` has the following script:

```json
{
  "scripts": {
    "start": "wrangler dev"
  }
}
```

Now, you can run:

```bash
npm start
```

And if you navigate to [http://localhost:8787](http://localhost:8787)... you
should see an error... `404 Not Found`. But that's actually OK! It means the
server is running - by default, the server won't return anything from the `/`
route.

### Running the migrations

This default, out-of-the-box `@workertown/search` service uses [D1]() as it's
storage layer - locally, this will be a SQLite instance that `wrangler` manages
for you.

To use the service, we need to run the database migrations. To do this, you can
make a `POST` request to the `/v1/admin/migrate` endpoint. Here's an example
using `curl`:

```bash
curl -XPOST -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/admin/migrate'
```

If all is well, you should see the response:

```json
{
  "status": 200,
  "success": true,
  "data": true
}
```

---

## Playing around with the service

Now we've got a working service, let's play around with it a bit.

### Index your first item

Let's get some data in there...

First, let's index item `1`:

```json
{
  "tenant": "test",
  "index": "test",
  "data": {
    "title": "Test item 1",
    "content": "This is some test content"
  }
}
```

You can index an item via a `PUT` request to the `/v1/items/1` endpoint. Here's
how the request is made via `curl`:

```bash
curl -XPUT -H 'Authorization: Bearer super_secret_api' -d '{ "tenant": "test", "index": "test",  "data": {  "title": "Test item 1", "content": "This is some test content" } }' 'localhost:8787/v1/items/1'
```

...and you should get a successful response:

```json
{
  "status": 200,
  "success": true,
  "data": {
    "id": "1",
    "tenant": "test",
    "index": "test",
    "data": {
      "title": "Test item 1",
      "content": "This is some test content"
    },
    "createdAt": "<SOME DATE>",
    "updatedAt": "<SOME DATE>"
  }
}
```

### Search for your first item

OK, with data in the service, we can test the search functionality. With only
the one record in the database, it should be relatively easy to find it.

You perform searches via the `/v1/search/:tenant/:index?` endpoint. The `:index`
parameter is optional, and if not provided, the search will be performed across
the entire `:tenant`.

We provide `term` query parameter for the text to search for, as well as a
`fields` query parameter, which is a comma-separated list of fields to perform
the search against. For this example, we'll use the `term` `"test"` and search
against the `field` `"content"`.

Here's the request via `curl`:

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test?term=test&fields=content'
```

...and you should see a successful response with our item `1`:

```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "id": "1",
      "item": {
        "id": "1",
        "tenant": "test",
        "index": "test",
        "data": {
          "title": "Test item 1",
          "content": "This is some test content"
        },
        "createdAt": "<SOME DATE>",
        "updatedAt": "<SOME DATE>"
      },
      "score": 0.4315231086776713,
      "terms": ["test"],
      "match": {
        "test": ["content"]
      }
    }
  ]
}
```

We've just performed our first search against the entire "test" tenant.
