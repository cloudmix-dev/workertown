import { createRouter } from "@workertown/internal-hono";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

router.get("/info", async (ctx) => {
  const config = ctx.get("config");

  return ctx.json({
    status: 200,
    success: true,
    data: {
      ...config,
      search: {
        ...config.search,
        stopWords: Array.from(config.search.stopWords as string[]),
      },
    },
  });
});

router.post("/migrate", async (ctx) => {
  const storage = ctx.get("storage");

  try {
    const { results, error } = await storage.runMigrations();
    const status = error ? 500 : 200;

    return ctx.json({ status, success: !error, data: results, error }, status);
  } catch (error) {
    return ctx.json({ status: 500, success: false, data: null, error }, 500);
  }
});

export { router };
