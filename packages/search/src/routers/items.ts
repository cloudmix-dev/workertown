import { zValidator } from "@hono/zod-validator";
import { authenticated } from "@workertown/middleware";
import { Hono } from "hono";
import { z } from "zod";

import { ContextBindings } from "../types";

const router = new Hono<ContextBindings>();

router.use("*", authenticated());

const getItem = router.get("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const storage = ctx.get("storage");
  const item = await storage.getItem(id);

  return ctx.jsonT({ status: 200, success: true, data: item });
});

export type GetItemRoute = typeof getItem;

const indexItem = router.put(
  "/:id",
  zValidator(
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
    const { tenant, index, data, tags } = ctx.req.valid("json");
    const item = await storage.indexItem({ id, tenant, index, data }, tags);

    return ctx.jsonT({ status: 200, success: true, data: item });
  }
);

export type IndexItemRoute = typeof indexItem;

const deleteItem = router.delete("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const storage = ctx.get("storage");

  await storage.deleteItem(id);

  return ctx.jsonT({ status: 200, success: true, data: true });
});

export type DeleteItemRoute = typeof deleteItem;

export { router };
