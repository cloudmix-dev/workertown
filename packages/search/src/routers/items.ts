import { createRouter, validate } from "@workertown/hono";
import { z } from "zod";

import { ContextBindings } from "../types";

const router = createRouter<ContextBindings>();

const getItem = router.get("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const storage = ctx.get("storage");
  const item = await storage.getItem(id);

  return ctx.jsonT({ status: 200, success: true, data: item });
});

export type GetItemRoute = typeof getItem;

const indexItem = router.put(
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

    return ctx.jsonT({ status: 200, success: true, data: item });
  }
);

export type IndexItemRoute = typeof indexItem;

const deleteItem = router.delete("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const storage = ctx.get("storage");
  const cache = ctx.get("cache");
  const item = await storage.getItem(id);

  if (item) {
    await storage.deleteItem(id);
    await cache.delete(`items_${item.tenant}_ALL`);
    await cache.delete(`items_${item.tenant}_${item.index}`);
  }

  return ctx.jsonT({ status: 200, success: true, data: true });
});

export type DeleteItemRoute = typeof deleteItem;

export { router };
