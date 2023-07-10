import { type MiddlewareHandler } from "hono";

export function authenticated() {
  const handler: MiddlewareHandler = async (ctx, next) => {
    const user = ctx.get("user") ?? null;

    if (user === null) {
      return ctx.json(
        {
          success: false,
          status: 403,
          data: null,
          error: "Forbidden",
        },
        403
      );
    }

    return next();
  };

  return handler;
}
