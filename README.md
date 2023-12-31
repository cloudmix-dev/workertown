# Workertown

> Sensible defaults, advanced configuration.

Workertown is a collection of packages for building edge-runtime architectures.

You can check out the docs [here](https://workertown.cloudmix.dev).

## Packages

- [@workertown/feature-flags](https://www.npmjs.com/package/@workertown/feature-flags)
- [@workertown/files](https://www.npmjs.com/package/@workertown/files)
- [@workertown/kv](https://www.npmjs.com/package/@workertown/kv)
- [@workertown/pub-sub](https://www.npmjs.com/package/@workertown/pub-sub)
- [@workertown/search](https://www.npmjs.com/package/@workertown/search)

## TL;DR

### Create a production-ready feature flag service on the edge

```bash
npx wrangler init feature-flags && cd ./feature-flags
```

```bash
npm i @workertown/feature-flags
```

```ts
// src/worker.ts
import { featureFlags } from "@workertown/feature-flags";

export default featureFlags();
```

```c
// wrangler.toml
name = "feature-flags"
main = "src/worker.ts"
compatibility_date = "2023-05-30"

workers_dev = false
route = { pattern = "flags.example.com/*", zone_name = "example.com" }

[vars]
FLAGS_API_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[kv_namespaces]]
binding = "FLAGS_CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[d1_databases]]
binding = "FLAGS_DB"
database_name = "feature-flags"
database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

```bash
npx wrangler publish
```

### Create a production-ready file service on the edge

```bash
npx wrangler init files && cd ./files
```

```bash
npm i @workertown/files
```

```ts
// src/worker.ts
import { files } from "@workertown/files";

export default files();
```

```c
// wrangler.toml
name = "files"
main = "src/worker.ts"
compatibility_date = "2023-05-30"

workers_dev = false
route = { pattern = "files.example.com/*", zone_name = "example.com" }

[vars]
FILES_API_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[d1_databases]]
binding = "FILES_DB"
database_name = "files"
database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[r2_buckets]]
binding = "FILES_FILES"
bucket_name = "files"
preview_bucket_name = "files"
```

### Create a production-ready key/value service on the edge

```bash
npx wrangler init kv && cd ./kv
```

```bash
npm i @workertown/kv
```

```ts
// src/worker.ts
import { kv } from "@workertown/kv";

export default kv();
```

```c
// wrangler.toml
name = "kv"
main = "src/worker.ts"
compatibility_date = "2023-05-30"

workers_dev = false
route = { pattern = "kv.example.com/*", zone_name = "example.com" }

[vars]
KV_API_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[kv_namespaces]]
binding = "KV_DB"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

```bash
npx wrangler publish
```

### Create a production-ready HTTP pub/sub service on the edge

```bash
npx wrangler init pub-sub && cd ./pub-sub
```

```bash
npm i @workertown/pub-sub
```

```ts
// src/worker.ts
import { pubSub } from "@workertown/pub-sub";

export default pubSub();
```

```c
// wrangler.toml
name = "pub-sub"
main = "src/worker.ts"
compatibility_date = "2023-05-30"

workers_dev = false
route = { pattern = "pubsub.example.com/*", zone_name = "example.com" }

[vars]
PUBSUB_API_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[d1_databases]]
binding = "PUBSUB_DB"
database_name = "pub-sub"
database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[queues.producers]]
queue = "pub-sub"
binding = "PUBSUB_QUEUE"

[[queues.consumers]]
queue = "pub-sub"
max_batch_size = 100
max_batch_timeout = 30
max_concurrency = 10
```

```bash
npx wrangler publish
```

### Create a production-ready text search service on the edge

```bash
npx wrangler init search && cd ./search
```

```bash
npm i @workertown/search
```

```ts
// src/worker.ts
import { search } from "@workertown/search";

export default search();
```

```c
// wrangler.toml
name = "search"
main = "src/worker.ts"
compatibility_date = "2023-05-30"

workers_dev = false
route = { pattern = "search.example.com/*", zone_name = "example.com" }

[vars]
SEARCH_API_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[kv_namespaces]]
binding = "SEARCH_CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[d1_databases]]
binding = "SEARCH_DB"
database_name = "search"
database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
preview_database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

```bash
npx wrangler publish
```
