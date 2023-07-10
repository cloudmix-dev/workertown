import { Hono } from "hono";

export function combine(...args: Hono[]) {
  const app = args.reduce((acc, hono) => acc.route("/", hono), new Hono());

  app.notFound((ctx) =>
    ctx.json(
      { success: false, status: 404, data: null, error: "Not found" },
      404
    )
  );

  app.onError((error, ctx) =>
    ctx.json(
      {
        success: false,
        status: 500,
        data: null,
        error: (error.cause as any)?.message ?? error.message,
      },
      500
    )
  );

  return app;
}
