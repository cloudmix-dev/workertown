import { featureFlags } from "@workertown/feature-flags";
import { files } from "@workertown/files";
import { kv } from "@workertown/kv";
import { pubSub } from "@workertown/pub-sub";
import { search } from "@workertown/search";
import { combine } from "@workertown/utils/combine";

const KV_KEY = "KV";
const D1_KEY = "D1";
const R2_KEY = "R2";
const QUEUES_KEY = "QUEUES";
const BASE_OPTIONS = {
  auth: {
    apiKey: {
      env: {
        apiKey: "API_KEY",
      },
    },
  },
};

const featureFlagsService = featureFlags({
  ...BASE_OPTIONS,
  basePath: "/flags",
  env: {
    cache: KV_KEY,
    db: D1_KEY,
  },
});
const filesService = files({
  ...BASE_OPTIONS,
  basePath: "/files",
  env: {
    db: D1_KEY,
    files: R2_KEY,
  },
});
const kvService = kv({
  ...BASE_OPTIONS,
  basePath: "/kv",
  env: {
    db: D1_KEY,
  },
});
const pubSubService = pubSub({
  ...BASE_OPTIONS,
  basePath: "/pubsub",
  env: {
    db: D1_KEY,
    queue: QUEUES_KEY,
  },
});
const searchService = search({
  ...BASE_OPTIONS,
  basePath: "/search",
  env: {
    cache: KV_KEY,
    db: D1_KEY,
  },
});

export default {
  ...combine(
    featureFlagsService,
    filesService,
    kvService,
    pubSubService,
    searchService,
  ),
  queue: pubSubService.queue,
};
