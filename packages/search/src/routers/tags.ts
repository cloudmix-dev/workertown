import { createRouter } from "@workertown/hono";

import { Context } from "../types";

const router = createRouter<Context>();

const getTags = router.get("/", async (ctx) => {
  const storage = ctx.get("storage");
  const tagRecords = await storage.getTags();

  return ctx.jsonT({ status: 200, success: true, data: tagRecords });
});

export type GetTagsRoute = typeof getTags;

export { router };
