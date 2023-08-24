import {
  type Options as SentryOptions,
  sentry as sentryMiddleware,
} from "@hono/sentry";

import { type Middleware } from "../types.js";

export { type SentryOptions };

export function sentry(options?: SentryOptions) {
  const handler: Middleware = sentryMiddleware(
    options,
  ) as unknown as Middleware;

  return handler;
}
