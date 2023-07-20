import {
  type Options as SentryOptions,
  sentry as sentryMiddleware,
} from "@hono/sentry";
import { type MiddlewareHandler } from "hono";

export { type SentryOptions };

export function sentry(options?: SentryOptions) {
  const handler: MiddlewareHandler = sentryMiddleware(options);

  return handler;
}
