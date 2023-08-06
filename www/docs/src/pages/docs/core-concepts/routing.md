---
title: Routing
description: Each Workertown package supports customising the routes of the service.
---

Each Workertown package supports customising the routes of the service via an
`endpoints` options. By **default**, all non-public endpoints are *versioned*
behind a `/v1` prefix to allow expansion/reimplementation of the API in the
future while supporting **backwards compatibility**.

---

## Customising `endpoints`

The `endpoints` option accepts an `object` with the following shape:

```ts
import { search } from "@workertown/search";

export default search({
  endpoints: {
    v1: {
      admin: "/v1/admin",
      // service specific endpoint options go here...
    },
    public: "/",
  },
});
```

The `endpoints.v1.admin` and `endpoints.public` options are available for 
**all** Workertown services.

The `endpoints.public` endpoint exposes **any** endpoint that **does not**
require authentication, such as the `/health` health-check endpoint.

The `endpoints.v1.admin` endpoint exposes the **admin** operation endpoints
for the service, such as the
[`v1/admin/migrate` endpoint](/docs/core-concepts/storage#migrations).
