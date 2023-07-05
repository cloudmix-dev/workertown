import { type MiddlewareHandler } from "hono";

export function authenticated() {
  const handler: MiddlewareHandler = async (ctx, next) => {
    const user = ctx.get("user") ?? null;

    if (user === null) {
      return new Response("Forbidden", { status: 403 });
    }

    return next();
  };

  return handler;
}
