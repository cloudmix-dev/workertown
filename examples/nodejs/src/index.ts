import { featureFlags } from "@workertown/feature-flags";
import { SqliteStorageAdapter as FeatureFlagsStorageAdapter } from "@workertown/feature-flags/storage/sqlite-storage-adapter";
import { kv } from "@workertown/kv";
import { SqliteStorageAdapter as KvStorageAdapter } from "@workertown/kv/storage/sqlite-storage-adapter";
import { search } from "@workertown/search";
import { SqliteStorageAdapter as SearchStorageAdapter } from "@workertown/search/storage/sqlite-storage-adapter";
import { combine, serve } from "@workertown/utils";
import * as path from "node:path";

const { PORT = "3000", API_KEY = "super_secret_api" } = process.env;

const api = combine(
  featureFlags({
    auth: {
      apiKey: {
        apiKey: API_KEY,
      },
    },
    basePath: "/flags",
    storage: new FeatureFlagsStorageAdapter({
      db: path.resolve(__dirname, "../db/flags.sqlite"),
    }),
  }),
  kv({
    auth: {
      apiKey: {
        apiKey: API_KEY,
      },
    },
    basePath: "/kv",
    storage: new KvStorageAdapter({
      db: path.resolve(__dirname, "../db/kv.sqlite"),
    }),
  }),
  search({
    auth: {
      apiKey: {
        apiKey: API_KEY,
      },
    },
    basePath: "/search",
    storage: new SearchStorageAdapter({
      db: path.resolve(__dirname, "../db/search.sqlite"),
    }),
  })
);

serve(api, { port: parseInt(PORT, 10) });

console.log(`Server running at http://localhost:${PORT}`);
