import {
  type Options as SentryOptions,
  sentry as sentryMiddleware,
} from "@hono/sentry";

import { type MiddlewareHandler } from "../router.js";

export { type SentryOptions };

export function sentry(options?: SentryOptions) {
  // biome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
  const handler: MiddlewareHandler<any> = sentryMiddleware(
    options,
  ) as unknown as MiddlewareHandler;

  return handler;
}
