import { createRouter, validate } from "@workertown/hono";
import { z } from "zod";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

router.get("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const storage = ctx.get("storage");
  const item = await storage.getItem(id);

  return ctx.json({ status: 200, success: true, data: item });
});

router.put(
  "/:id",
  validate(
    "json",
    z.object({
      tenant: z.string(),
      index: z.string(),
      data: z.record(z.unknown()),
      tags: z.array(z.string()).optional(),
    })
  ),
  async (ctx) => {
    const id = ctx.req.param("id");
    const storage = ctx.get("storage");
    const cache = ctx.get("cache");
    const { tenant, index, data, tags } = ctx.req.valid("json");
    const item = await storage.indexItem({ id, tenant, index, data }, tags);

    await cache.delete(`items_${tenant}_ALL`);
    await cache.delete(`items_${tenant}_${index}`);

    return ctx.json({ status: 200, success: true, data: item });
  }
);

router.delete("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const storage = ctx.get("storage");
  const cache = ctx.get("cache");
  const item = await storage.getItem(id);

  if (item) {
    await storage.deleteItem(id);
    await cache.delete(`items_${item.tenant}_ALL`);
    await cache.delete(`items_${item.tenant}_${item.index}`);
  }

  return ctx.json({ status: 200, success: true, data: true });
});

export { router };
