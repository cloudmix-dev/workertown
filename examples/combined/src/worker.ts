import { featureFlags } from "@workertown/feature-flags";
import { search } from "@workertown/search";
import { combine } from "@workertown/utils/combine";

const baseOptions = {
  auth: {
    apiKey: {
      env: {
        apiKey: "API_KEY",
      },
    },
  },
  env: {
    cache: "CACHE",
    db: "DB",
  },
};

export default combine(
  featureFlags({
    ...baseOptions,
    basePath: "/flags",
    env: {
      cache: "CACHE",
      db: "DB",
    },
  }),
  search({
    ...baseOptions,
    basePath: "/search",
    env: {
      cache: "CACHE",
      db: "DB",
    },
  }),
);
