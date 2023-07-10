import { authenticated } from "@workertown/middleware";
import { Hono } from "hono";

import { ContextBindings } from "../types";

const router = new Hono<ContextBindings>();

router.use("*", authenticated());

const info = router.get("/info", (ctx) => {
  const config = ctx.get("config");

  return ctx.jsonT({ status: 200, success: true, data: config });
});

export type InfoRoute = typeof info;

const runMigrations = router.post("/migrate", async (ctx) => {
  const storage = ctx.get("storage");
  let success = true;

  try {
    await storage.runMigrations();
  } catch (_) {
    success = false;
  }

  return ctx.jsonT(
    { status: success ? 200 : 500, success, data: success },
    success ? 200 : 500
  );
});

export type RunMigrationsRoute = typeof runMigrations;

export { router };
