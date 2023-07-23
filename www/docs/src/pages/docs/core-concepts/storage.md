---
title: Storage
description: Workertown packages that require persistant storage provide a simple way for you to provide your own storage implementations.
---

Most Workertown services require some kind of persistant storage, i.e. data that
lives between requests. Following the "sensible defaults" paradigm, each of
these services provides a default storage adapter built upon Cloudflare's D1
SQLite database, but there are other options available, and also the ability to
bring your own storage adapter entirely.

---

## How it works

Workertown services that require storage expose a `options.storage`
configuration option that allows you to specify a storage adapter to use.

```ts
import { search } from "@workertown/search";
import { SqliteStorageAdapter } from "@workertown/search/storage/sqlite";

export default search({
  storage: new SqliteStorageAdapter({
    // Options go here...
  }),
});
```

---

## Supported storage adapters

Every Workertown service with storage support has a set of supported first-party
storage adapters provided within the package.

### D1 (default)

The [D1](https://developers.cloudflare.com/d1/) storage adapter is the
**default** storage adapter for all Workertown services, and so any Workertown
service that requires storage will require a bound D1 database to run.

The `D1StorageAdapter` is exposed from each package, but in reality you should
**never** have to manually instantiate this adapter.

```ts
import { search } from "@workertown/search";
import { D1StorageAdapter } from "@workertown/search/storage/d1";

export default search({
  storage: new D1StorageAdapter({
    d1: { /*...*/ }, // The D1Namespace instance from the environment
  }),
});
```

```c
[[d1_databases]]
binding = "DB"
database_name = "example_db"
database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

{% callout type="warning" title="The above won't work" %}
The example above is contrived, and won't actually work within the Cloudflare
Workers runtime. In reality, you would have to create your own `fetch`
implementation that retrieves the `D1Namespace`` instance from the environment
and then builds the Workertown service on each request.
{% /callout %}

### Planetscale

[Planetscale](https://planetscale.com) is a hosted MySQL database that provides
SQL (Vitess) databases that are accessible via a REST API - meaning they are
edge runtime compatible.

```ts
import { search } from "@workertown/search";
import { PlanetscaleStorageAdapter } from "@workertown/search/storage/planetscale";

export default search({
  storage: new PlanetscaleStorageAdapter({
    url: "...", // The URL of the Planetscale database
    username: "username", // The Planetscale username to use for authentication
    password: "password", // The Planetscale password to use for authentication
  }),
});
```

### Turso

[Turso](https://turso.tech) is a hosted Sqlite (libsql) database provider that
provides a REST API for interacting with Sqlite databases.

```ts
import { search } from "@workertown/search";
import { TursoStorageAdapter } from "@workertown/search/storage/turso";

export default search({
  storage: new TursoStorageAdapter({
    url: "...", // The URL of the Turso database
    authToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", // The Turso auth token to use for authentication
  }),
});
```

### Sqlite

If you are running your Workertown service in a NodeJS environment, you can use
[Sqlite](https://www.sqlite.org/index.html) as your storage adapter to persist
data directly on the disk in your environment.

```ts
import { search } from "@workertown/search";
import { SqliteStorageAdapter } from "@workertown/search/storage/sqlite";

export default search({
  storage: new SqliteStorageAdapter({
    db: "db.sqlite", // The path to the Sqlite database file
  }),
});
```

### Memory (dev only)

For situations where you would like to only **simulate** storage (such as when
running tests), you can use the `MemoryStorageAdapter` to store data in memory.

This will **not** persist any data to disk, and therefore any values stored are
lost when the process is terminated.

```ts
import { search } from "@workertown/search";
import { MemoryStorageAdapter } from "@workertown/search/storage/memory";

export default search({
  storage: new MemoryStorageAdapter(),
});
```

{% callout type="warning" title="For development use only" %}
The memory storage adapter is **not** intended for production use of any kind,
and should only be used in development environments.
{% /callout %}

---

## Bring your own storage adapter

Each Workertown service with storage support exposes a `StorageAdapter` class
that can be extended upon to create your own storage adapter.

```ts
import { search } from "@workertown/search";
import { StorageAdapter } from "@workertown/search/storage";

class CustomStorageAdapter extends StorageAdapter {
  // Implement the required methods here...
}

export default search({
  storage: new CustomStorageAdapter(),
});
```

Each `StorageAdapter` class exposes a different set of methods that must be
implemented for full storage support in a particular Workertown service.

---

## Migrations

For storage adapters built upon relational databases, each Workertown service
exposes an endpoint to run the migrations required to run the service. The
endpoint takes a `POST` request with an empty JSON body to run the migrations.

By **default**, this endpoint is exposed at `/v1/admin/migrate`, but this can be
configured via the `options.endpoints.v1.admin` configuration option.

```ts
import { search } from "@workertown/search";

export default search({
  endpoints: {
    v1: {
      admin: "custom-admin", // Migrations can now be run from /custom-admin/migrate
    }
  }
});
```

{% callout type="warning" title="Run this first" %}
When first deploying a Workertown service with storage support, you must run the
migrations via the `/v1/admin/migrate` endpoint before the service will work
correctly.
{% /callout %}
