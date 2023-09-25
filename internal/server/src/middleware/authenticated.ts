import { type MiddlewareHandler } from "../router.js";
import { type User } from "../types.js";

export function authenticated() {
  // biome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
  const handler: MiddlewareHandler<any> = async (ctx, next) => {
    const user: User | null = ctx.get("user") ?? null;

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
          "X-Workertown-Hint": "The user is not authenticated",
        },
      );
    }

    return next();
  };

  return handler;
}
