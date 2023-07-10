import { Hono } from "hono";

import { ContextBindings } from "../types";

const router = new Hono<ContextBindings>();

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
