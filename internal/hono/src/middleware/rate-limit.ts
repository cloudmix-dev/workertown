import { type DeepPartial } from "@workertown/internal-types";
// rome-ignore lint/correctness/noUnusedVariables: wip
import { type MiddlewareHandler } from "hono";
// rome-ignore lint/correctness/noUnusedVariables: wip
import merge from "lodash.merge";

interface RateLimitOptions {
  env: {
    kv: string;
  };
  limit: number;
  window: number;
}

export type RateLimitOptionsOptional = DeepPartial<RateLimitOptions>;

// rome-ignore lint/correctness/noUnusedVariables: wip
const DEFAULT_OPTIONS: RateLimitOptions = {
  env: {
    kv: "RATE_LIMIT_KV",
  },
  limit: 10,
  window: 60 * 1000,
};
