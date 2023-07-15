import { createRouter } from "@workertown/hono";

import { type Context } from "../types.js";

const router = createRouter<Context>();

router.get("/info", async (ctx) => {
  const config = ctx.get("config");

  return ctx.jsonT({
    status: 200,
    success: true,
    data: config as any,
  });
});

router.post("/migrate", async (ctx) => {
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

export { router };
