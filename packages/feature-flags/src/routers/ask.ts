import { zValidator } from "@hono/zod-validator";
import { authenticated } from "@workertown/middleware";
import { Hono } from "hono";
import { z } from "zod";

import { FlagContext } from "../storage/storage-adapter";
import { ContextBindings } from "../types";

const router = new Hono<ContextBindings>();

router.use("*", authenticated());

function validateContext(
  context: Record<string, unknown>,
  flagContexts: FlagContext[]
) {
  let result = true;

  for (const flagContext of flagContexts) {
    const value = context[flagContext.field];

    switch (flagContext.operator) {
      case "eq":
        result = value === flagContext.value;

        break;
      case "neq":
        result = value !== flagContext.value;

        break;
      case "gt":
        result = Boolean(value && value > flagContext.value);

        break;
      case "gte":
        result = Boolean(value && value >= flagContext.value);

        break;
      case "lt":
        result = Boolean(value && value < flagContext.value);

        break;
      case "lte":
        result = Boolean(value && value <= flagContext.value);

        break;
      case "in":
        result =
          Array.isArray(flagContext.value) &&
          // @ts-ignore
          flagContext.value.includes(value);

        break;
      case "nin":
        result =
          Array.isArray(flagContext.value) &&
          // @ts-ignore
          !flagContext.value?.includes(value);

        break;
      default:
        result = false;
    }
  }

  return result;
}

const ask = router.post(
  "/",
  zValidator(
    "json",
    z.object({
      flags: z.array(z.string()).nonempty().optional(),
      context: z.record(z.any()).optional(),
    })
  ),
  async (ctx) => {
    const storage = ctx.get("storage");
    const { flags: proposedFlags, context } = ctx.req.valid("json");
    const flags = await storage.getFlags();
    const applicableFlags = proposedFlags
      ? flags.filter((flag) => proposedFlags.includes(flag.name))
      : flags;
    const result = applicableFlags
      .filter((flag) => {
        if (!flag.context) {
          return true;
        }

        if (!context) {
          return false;
        }

        return validateContext(context, flag.context);
      })
      .map((flag) => flag.name);

    return ctx.jsonT({ status: 200, success: true, data: result });
  }
);

export type AskRoute = typeof ask;

export { router };
