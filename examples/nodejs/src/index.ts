import { featureFlags } from "@workertown/feature-flags";
import { SqliteStorageAdapter as FeatureFlagsStorageAdapter } from "@workertown/feature-flags/storage/sqlite-storage-adapter";
import { kv } from "@workertown/kv";
import { SqliteStorageAdapter as KvStorageAdapter } from "@workertown/kv/storage/sqlite-storage-adapter";
import { serve } from "@workertown/node";
import { pubSub } from "@workertown/pub-sub";
import { createQueueProcessor } from "@workertown/pub-sub/queue";
import { SqliteQueueAdapter } from "@workertown/pub-sub/queue/sqlite-queue-adapter";
import { SqliteStorageAdapter as PubSubStorageAdapter } from "@workertown/pub-sub/storage/sqlite-storage-adapter";
import { search } from "@workertown/search";
import { SqliteStorageAdapter as SearchStorageAdapter } from "@workertown/search/storage/sqlite-storage-adapter";
import { combine } from "@workertown/utils";
import * as path from "node:path";
import * as url from "node:url";

const { PORT = "3000", API_KEY = "super_secret_api" } = process.env;
const DIRNAME = url.fileURLToPath(new URL(".", import.meta.url));

const flagsApi = featureFlags({
  auth: {
    apiKey: {
      apiKey: API_KEY,
    },
  },
  basePath: "/flags",
  storage: new FeatureFlagsStorageAdapter({
    db: path.resolve(DIRNAME, "../db/flags.sqlite"),
  }),
});

const kvApi = kv({
  auth: {
    apiKey: {
      apiKey: API_KEY,
    },
  },
  basePath: "/kv",
  storage: new KvStorageAdapter({
    db: path.resolve(DIRNAME, "../db/kv.sqlite"),
  }),
});

const pubSubQueueAdapter = new SqliteQueueAdapter({
  db: path.resolve(DIRNAME, "../db/pub-sub-queue.sqlite"),
});
const pubSubApi = pubSub({
  auth: {
    apiKey: {
      apiKey: API_KEY,
    },
  },
  basePath: "/pub-sub",
  queue: pubSubQueueAdapter,
  storage: new PubSubStorageAdapter({
    db: path.resolve(DIRNAME, "../db/pub-sub.sqlite"),
  }),
});

const searchApi = search({
  auth: {
    apiKey: {
      apiKey: API_KEY,
    },
  },
  basePath: "/search",
  storage: new SearchStorageAdapter({
    db: path.resolve(DIRNAME, "../db/search.sqlite"),
  }),
});

const api = combine(flagsApi, kvApi, pubSubApi, searchApi);

(async function main() {
  serve(api, { port: parseInt(PORT, 10) });

  console.log(`Server running at http://localhost:${PORT}`);

  const processor = createQueueProcessor({
    adapter: pubSubQueueAdapter,
    server: api,
  });

  await pubSubQueueAdapter.runMigrations();

  setInterval(async () => {
    await processor.process();
  }, 1000);

  console.log(`PubSub queue processor running`);
})();
