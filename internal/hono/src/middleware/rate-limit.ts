import { type DeepPartial } from "@workertown/internal-types";
import { type MiddlewareHandler } from "hono";
import merge from "lodash.merge";

interface RateLimitOptions {
  env: {
    kv: string;
  };
  limit: number;
  window: number;
}

export type RateLimitOptionsOptional = DeepPartial<RateLimitOptions>;

const DEFAULT_OPTIONS: RateLimitOptions = {
  env: {
    kv: "RATE_LIMIT_KV",
  },
  limit: 10,
  window: 60 * 1000,
};
