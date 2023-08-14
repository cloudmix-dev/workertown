import { featureFlags } from "@workertown/feature-flags";
import { kv } from "@workertown/kv";
import { pubSub } from "@workertown/pub-sub";
import { search } from "@workertown/search";
import { combine } from "@workertown/utils/combine";

const KV_KEY = "KV";
const D1_KEY = "D1";
const BASE_OPTIONS = {
  auth: {
    apiKey: {
      env: {
        apiKey: "API_KEY",
      },
    },
  },
};

export default combine(
  featureFlags({
    ...BASE_OPTIONS,
    basePath: "/flags",
    env: {
      cache: KV_KEY,
      db: D1_KEY,
    },
  }),
  kv({
    ...BASE_OPTIONS,
    basePath: "/kv",
    env: {
      db: D1_KEY,
    },
  }),
  pubSub({
    ...BASE_OPTIONS,
    basePath: "/pubsub",
    env: {
      db: D1_KEY,
    },
  }),
  search({
    ...BASE_OPTIONS,
    basePath: "/search",
    env: {
      cache: KV_KEY,
      db: D1_KEY,
    },
  }),
);
