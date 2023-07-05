import { Hono } from "hono";

import { ContextBindings } from "../types";

const router = new Hono<ContextBindings>();

const openApi = router.get("/open-api.json", (ctx) => {
  const { prefixes } = ctx.get("config");

  return ctx.jsonT({ prefixes });
});

export type OpenApiRoute = typeof openApi;

export { router };
