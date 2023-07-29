import { type MiddlewareHandler } from "hono";

export function authenticated() {
  const handler: MiddlewareHandler = async (ctx, next) => {
    const user = ctx.get("user") ?? null;

    if (user === null) {
      return ctx.json(
        {
          success: false,
          status: 401,
          data: null,
          error: "Unauthorized",
        },
        401,
        {
          "x-workertown-hint": "The user is not authenticated",
        },
      );
    }

    return next();
  };

  return handler;
}
