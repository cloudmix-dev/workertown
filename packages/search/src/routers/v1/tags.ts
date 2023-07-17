import { createRouter } from "@workertown/hono";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

router.get("/", async (ctx) => {
  const storage = ctx.get("storage");
  const tagRecords = await storage.getTags();

  return ctx.json({ status: 200, success: true, data: tagRecords });
});

export { router };
