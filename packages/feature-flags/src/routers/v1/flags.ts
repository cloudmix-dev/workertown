import { createRouter, validate } from "@workertown/internal-hono";
import { z } from "zod";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

router.get(
  "/",
  validate(
    "query",
    z.object({
      include_disabled: z
        .enum(["1", "0", "true", "false"])
        .optional()
        .transform((val) => val === "1" || val === "true"),
    })
  ),
  async (ctx) => {
    const storage = ctx.get("storage");
    const { include_disabled: includeDisabled } = ctx.req.valid("query");
    const flags = await storage.getFlags(includeDisabled);

    return ctx.json({ status: 200, success: true, data: flags });
  }
);

router.get("/:name", async (ctx) => {
  const storage = ctx.get("storage");
  const name = ctx.req.param("name");
  const flag = await storage.getFlag(name);

  return ctx.json({ status: 200, success: true, data: flag });
});

router.put(
  "/:name",
  validate(
    "json",
    z.object({
      description: z.string().optional(),
      enabled: z.boolean().optional(),
      conditions: z
        .array(
          z.object({
            field: z.string(),
            operator: z.enum([
              "eq",
              "neq",
              "gt",
              "gte",
              "lt",
              "lte",
              "in",
              "nin",
            ]),
            value: z.union([
              z.string(),
              z.number(),
              z.boolean(),
              z.array(z.string()),
              z.array(z.number()),
              z.array(z.boolean()),
            ]),
          })
        )
        .nonempty()
        .optional(),
    })
  ),
  async (ctx) => {
    const storage = ctx.get("storage");
    const name = ctx.req.param("name");
    const { description, enabled, conditions } = ctx.req.valid("json");
    const flag = await storage.upsertFlag({
      name,
      description,
      enabled: enabled ?? true,
      conditions,
    });

    return ctx.json({ status: 200, success: true, data: flag });
  }
);

router.delete("/:name", async (ctx) => {
  const storage = ctx.get("storage");
  const name = ctx.req.param("name");

  await storage.deleteFlag(name);

  return ctx.json({ status: 200, success: true, data: true });
});

export { router };
