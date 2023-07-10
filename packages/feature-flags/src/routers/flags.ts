import { zValidator } from "@hono/zod-validator";
import { authenticated } from "@workertown/middleware";
import { Hono } from "hono";
import { z } from "zod";

import { ContextBindings } from "../types";

const router = new Hono<ContextBindings>();

router.use("*", authenticated());

const getFlags = router.get(
  "/",
  zValidator(
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

    return ctx.jsonT({ status: 200, success: true, data: flags });
  }
);

export type GetFlagsRoute = typeof getFlags;

const getFlag = router.get("/:name", async (ctx) => {
  const storage = ctx.get("storage");
  const name = ctx.req.param("name");
  const flag = await storage.getFlag(name);

  return ctx.jsonT({ status: 200, success: true, data: flag });
});

export type GetFlagRoute = typeof getFlag;

const upsertFlag = router.put(
  "/:name",
  zValidator(
    "json",
    z.object({
      description: z.string().optional(),
      enabled: z.boolean().optional(),
      context: z
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
    const { description, enabled, context } = ctx.req.valid("json");
    const flag = await storage.upsertFlag({
      name,
      description,
      enabled: enabled ?? true,
      context,
    });

    return ctx.jsonT({ status: 200, success: true, data: flag });
  }
);

export type UpsertFlagRoute = typeof upsertFlag;

const deleteFlag = router.delete("/:name", async (ctx) => {
  const storage = ctx.get("storage");
  const name = ctx.req.param("name");

  await storage.deleteFlag(name);

  return ctx.jsonT({ status: 200, success: true, data: true });
});

export type DeleteFlagRoute = typeof deleteFlag;

export { router };
