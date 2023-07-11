import { createRouter } from "@workertown/hono";

import { Context } from "../types";

const router = createRouter<Context>({ public: true });

const openApi = router.get("/open-api.json", (ctx) => {
  const { prefixes } = ctx.get("config");

  return ctx.jsonT({ prefixes });
});

export type OpenApiRoute = typeof openApi;

const health = router.get("/health", async (ctx) =>
  ctx.json({ status: 200, success: true, data: "OK" })
);

export type HealthRoute = typeof health;

export { router };
