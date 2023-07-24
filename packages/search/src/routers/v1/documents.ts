import { createRouter, validate } from "@workertown/internal-hono";
import { z } from "zod";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

router.get("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const storage = ctx.get("storage");
  const document = await storage.getDocument(id);

  return ctx.json({ status: 200, success: true, data: document });
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
    }),
  ),
  async (ctx) => {
    const id = ctx.req.param("id");
    const storage = ctx.get("storage");
    const cache = ctx.get("cache");
    const { tenant, index, data, tags } = ctx.req.valid("json");
    const document = await storage.upsertDocument(
      { id, tenant, index, data },
      tags,
    );

    await cache.delete(`documents_${tenant}_ALL`);
    await cache.delete(`documents_${tenant}_${index}`);

    return ctx.json({ status: 200, success: true, data: document });
  },
);

router.delete("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const storage = ctx.get("storage");
  const cache = ctx.get("cache");
  const document = await storage.getDocument(id);

  if (document) {
    await storage.deleteDocument(id);
    await cache.delete(`documents_${document.tenant}_ALL`);
    await cache.delete(`documents_${document.tenant}_${document.index}`);
  }

  return ctx.json({ status: 200, success: true, data: true });
});

export { router };
