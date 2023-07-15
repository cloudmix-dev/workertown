import { createRouter } from "@workertown/hono";

import { Context } from "../types";

const router = createRouter<Context>();

const info = router.get("/info", async (ctx) => {
  const config = ctx.get("config");

  if (typeof config.scanRange === "function") {
    // @ts-ignore
    delete config.scanRange;
  }

  if (typeof config.stopWords === "function") {
    // @ts-ignore
    delete config.stopWords;
  }

  return ctx.jsonT({
    status: 200,
    success: true,
    data: config as any,
  });
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
