---
title: Combining APIs
description: Workertown services can be combined into one single REST API.
---

Sometimes, you don't want to have multiple domains for your services. While you
can create reverse proxies/load balancers to handle routing for you, the
`@workertown/utils` package provides a simple way to combine multiple services
into a single REST API.

---

## Usage

Install the `@workertown/utils` package and call the `combine` export:

```typescript
import { cms } from "@workertown/cms";
import { search } from "@workertown/search";
import { combine } from "@workertown/utils";

export default combine(
  cms({ basePath: "/cms" }),
  search({ basePath: "/search" })
);

// ⬆️ A combined search and CMS API
```

{% callout type="warning" title="Remember to set the `basePath`!" %}
By default, combined services are mounted at the root of the API (`/`). If you
would like to _namespace_ each service within the combined API, you must set
the `basePath` option for each service.

The example above makes the CMS endpoints available at `/cms/*` and the search
endpoints available at `/search/*`.
{% /callout %}
