import { createRouter } from "@workertown/internal-hono";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

router.get("/info", async (ctx) => {
  const config = ctx.get("config");

  return ctx.json({
    status: 200,
    success: true,
    data: config as {},
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

  return ctx.json(
    { status: success ? 200 : 500, success, data: success },
    success ? 200 : 500,
  );
});

export { router };
