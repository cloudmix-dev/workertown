import { createRouter, validate } from "@workertown/internal-server";
import { z } from "zod";

import { CACHE } from "../../constants.js";
import { type Flag } from "../../storage/storage-adapter.js";
import { type Context } from "../../types.js";

const router = createRouter<Context>();

const getFlagsQuerySchema = z.object({
  include_disabled: z
    .enum(["1", "0", "true", "false"])
    .optional()
    .transform((val) => val === "1" || val === "true"),
});

router.get("/", validate("query", getFlagsQuerySchema), async (ctx) => {
  const cache = ctx.get("cache");
  const storage = ctx.get("storage");
  const { include_disabled: includeDisabled } = ctx.req.valid(
    "query" as never,
  ) as z.infer<typeof getFlagsQuerySchema>;
  const cacheKey = includeDisabled ? CACHE.FLAGS.ALL : CACHE.FLAGS.ENABLED;
  let flags: Flag[] | null = await cache.get(cacheKey);

  if (!flags) {
    flags = await storage.getFlags(includeDisabled);

    await cache.set(cacheKey, flags);
  }

  return ctx.json({ status: 200, success: true, data: flags });
});

router.get("/:name", async (ctx) => {
  const storage = ctx.get("storage");
  const name = ctx.req.param("name");
  const flag = await storage.getFlag(name);
  const status = flag ? 200 : 404;

  return ctx.json({ status, success: true, data: flag }, status);
});

const createFlagBodySchema = z.object({
  description: z.string().optional(),
  enabled: z.boolean().optional().default(true),
  conditions: z
    .array(
      z.object({
        field: z.string(),
        operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in", "nin"]),
        value: z.union([
          z.string(),
          z.number(),
          z.boolean(),
          z.array(z.string()),
          z.array(z.number()),
          z.array(z.boolean()),
        ]),
      }),
    )
    .nonempty()
    .optional(),
});

router.put("/:name", validate("json", createFlagBodySchema), async (ctx) => {
  const cache = ctx.get("cache");
  const storage = ctx.get("storage");
  const name = ctx.req.param("name");
  const { description, enabled, conditions } = ctx.req.valid(
    "json" as never,
  ) as z.infer<typeof createFlagBodySchema>;
  const flag = await storage.upsertFlag({
    name,
    description,
    enabled: enabled ?? true,
    conditions,
  });

  await cache.delete(CACHE.FLAGS.ALL);
  await cache.delete(CACHE.FLAGS.ENABLED);

  return ctx.json({ status: 200, success: true, data: flag });
});

router.delete("/:name", async (ctx) => {
  const cache = ctx.get("cache");
  const storage = ctx.get("storage");
  const name = ctx.req.param("name");

  await storage.deleteFlag(name);
  await cache.delete(CACHE.FLAGS.ALL);
  await cache.delete(CACHE.FLAGS.ENABLED);

  return ctx.json({ status: 200, success: true, data: { name } });
});

export { router };
