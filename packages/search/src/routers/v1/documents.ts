import { createRouter, validate } from "@workertown/internal-server";
import { z } from "zod";

import { type Context } from "../../types.js";
import { getCacheKey } from "../../utils.js";

const router = createRouter<Context>();

router.get("/:id", async (ctx) => {
  const id = ctx.req.param("id");
  const storage = ctx.get("storage");
  const document = await storage.getDocument(id);
  const status = document ? 200 : 404;

  return ctx.json({ status: status, success: true, data: document }, status);
});

const createSearchItemBodySchema = z.object({
  tenant: z.string(),
  index: z.string(),
  data: z.record(z.unknown()),
  tags: z.array(z.string()).optional(),
});

router.put(
  "/:id",
  validate("json", createSearchItemBodySchema),
  async (ctx) => {
    const id = ctx.req.param("id");
    const storage = ctx.get("storage");
    const cache = ctx.get("cache");
    const { tenant, index, data, tags } = ctx.req.valid(
      "json" as never,
    ) as z.infer<typeof createSearchItemBodySchema>;
    const document = await storage.upsertDocument(
      { id, tenant, index, data },
      tags,
    );

    await cache.delete(getCacheKey(tenant));
    await cache.delete(getCacheKey(tenant, index));

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
    await cache.delete(getCacheKey(document.tenant));
    await cache.delete(getCacheKey(document.tenant, document.index));
  }

  return ctx.json({ status: 200, success: true, data: { id } });
});

export { router };
