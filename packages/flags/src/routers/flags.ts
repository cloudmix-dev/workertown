import { authenticated } from "@workertown/middleware";
import { Hono } from "hono";

import { ContextBindings } from "../types";

const router = new Hono<ContextBindings>();

router.use("*", authenticated());

const getFlags = router.get("/info", (ctx) => {
  const config = ctx.get("config");

  return ctx.jsonT({ status: 200, success: true, data: config });
});

export type GetFlagsRoute = typeof getFlags;

export { router };
