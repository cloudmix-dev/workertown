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

You can index an item via a `PUT` request to the `/v1/items/:id` endpoint.
Here's how the request is made via `curl`:

```bash
curl -XPUT -H 'Authorization: Bearer super_secret_api' -d '{ "tenant": "test", "index": "test",  "data": { "title": "Test item 1", "content": "This is some test content" } }' 'localhost:8787/v1/items/1'
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

{% callout title="Updating an item" %}
The `PUT` request to the `/v1/items/:id` endpoint will create an item if it
doesn't exist, or update it if an item with the same `id`, `tenant` and `index`
already exists.
{% /callout %}

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

### Get suggestions based on your first item

We can also request a list of suggestions from our search service. This can be
done via the `/v1/suggest/:tenant/:index?` endpoint. This endpoint takes the
exact same route parameters and query parameters as the
`/v1/search/:tenant/:index?` endpoint.

Here it is in `curl`:

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/suggest/test?term=test&fields=content'
```

...you should see a successful response:

```json
{
  "status": 200,
  "success": true,
  "data": [
    {
      "suggestion": "test",
      "terms": ["test"],
      "score": 0.4315231086776713
    }
  ]
}
```

Awesome! This endpoint can be handy for powering automcomplete functionality.

### Add a tag to your first item

Tagging allows you to filter out (at the database level) items you don't want to
be included in search/suggestion results.

You can tag an item by including an array of strings under the `tag` property
when you index it. Replace the item via the `/v1/items/:id` endpoint:

```bash
curl -XPUT -H 'Authorization: Bearer super_secret_api' -d '{ "tenant": "test", "index": "test",  "data": { "title": "Test item 1", "content": "This is some test content" }, "tags": ["test"] }' 'localhost:8787/v1/items/1'
```

...and then you can search for your item via the `"test"` tag we just added:

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test?term=test&fields=content&tags=test'
```

...which should return the item:

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

You can verify the tag is functioning correctly by searching via a different
one:

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test?term=test&fields=content&tags=invalid'
```

...which should return an empty array:

```json
{
  "status": 200,
  "success": true,
  "data": []
}
```

A search with multiple tags acts as an **and** operation, meaning that all tags
must be present for an item to be included in the search.

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test?term=test&fields=content&tags=test,invalid'
```

...will return an empty array:

```json
{
  "status": 200,
  "success": true,
  "data": []
}
```

...but if you add another tag to the item:

```bash
curl -XPUT -H 'Authorization: Bearer super_secret_api' -d '{ "tenant": "test", "index": "test",  "data": { "title": "Test item 1", "content": "This is some test content" }, "tags": ["test", "test2"] }' 'localhost:8787/v1/items/1'
```

...and search for both, you should see the item:

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test?term=test&fields=content&tags=test,test2'
```

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

There you have it, you've just used tags!

### Adding more items

Let's add some more items to our tenant, so that we can search _across_ a varied
dataset.

Here are example `curl` commands:

```bash
curl -XPUT -H 'Authorization: Bearer super_secret_api' -d '{ "tenant": "test", "index": "test",  "data": { "title": "Test item 2", "content": "This is also some test content" }, "tags": ["test"] }' 'localhost:8787/v1/items/2'
```

```bash
curl -XPUT -H 'Authorization: Bearer super_secret_api' -d '{ "tenant": "test", "index": "test",  "data": { "title": "Test item 3", "content": "This is again some test content" }, "tags": ["test2"] }' 'localhost:8787/v1/items/3'
```

```bash
curl -XPUT -H 'Authorization: Bearer super_secret_api' -d '{ "tenant": "test", "index": "other",  "data": { "title": "Test item 4", "content": "This is some test content in another index" }, "tags": ["test"] }' 'localhost:8787/v1/items/4'
```

```bash
curl -XPUT -H 'Authorization: Bearer super_secret_api' -d '{ "tenant": "test", "index": "other",  "data": { "title": "Test item 3", "content": "This is also some test content in another index" }, "tags": ["test2"] }' 'localhost:8787/v1/items/5'
```

You now have **5** items in your tenant across **2** indexes (`test` and
`other`).

Let's try some more search queries:

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test/test?term=test&fields=content'
```

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test/test?term=content&fields=content'
```

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test/test?term=content&fields=title'
```

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test/test?term=content&fields=title,content'
```

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test/test?term=test&fields=content&tags=test'
```

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test/test?term=test&fields=content&tags=test2'
```

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/v1/search/test/other?term=test&fields=content'
```

The responses to each of the above requests should be fairly self-explanatory,
and give you a good indication of how the service functions.

{% callout title="Homework..." %}
Now you have the gist of how to search and get suggestions from the API, try
experimenting with different search terms, fields, and tags to see how the
results change.
{% /callout %}

---

## Customising the service

The `@workertown/search` package allows various aspects of how the service
functions to be customised via the `options` parameter.

```typescript
import { search } from "@workertown/search";

export default search({
  // options go here...
});
```

### Customising endpoints

One thing you can customise are the URL prefixes for all of the available
endpoints. Let's change the search endpoint to our own:

```typescript
import { search } from "@workertown/search";

export default search({
  prefixes: {
    search: "/custom/search",
  },
});
```

Now when you hit `/v1/search/:tenant/:index`, you'll get a `404` response, but
if you make the same request to `/custom/search/:tenant/:index`, you'll get see
the expected response:

```bash
curl -XGET -H 'Authorization: Bearer super_secret_api' 'localhost:8787/custom/search/test/test?term=test&fields=content'
```

You can also customise other endpoints of your service, such as the
`/v1/suggest/*` endpoint, and the `/v1/items/*` endpoints.

### Customising the search engine performance

A powerful option that can have a big impact on the performance of your service
is the ability to set how many records are retrieved from the database to
perform a search on. The default value is **1000**.

```typescript
import { search } from "@workertown/search";

export default search({
  prefixes: {
    search: "/custom/search",
  },
  scanRange: 500,
});
```

We've set the `scanRange` to **500**. This means that when a search is
performed, we'll only load **at most** 500 records from the database to perform
the search against.
