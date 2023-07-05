import { authenticated } from "@workertown/middleware";
import { Hono } from "hono";

import { ContextBindings } from "../types";

const router = new Hono<ContextBindings>();

router.use("*", authenticated());

const getTags = router.get("/", async (ctx) => {
  const storage = ctx.get("storage");
  const tagRecords = await storage.getTags();

  return ctx.jsonT({ status: 200, success: true, data: tagRecords });
});

export type GetTagsRoute = typeof getTags;

export { router };
