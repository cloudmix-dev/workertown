import { createRouter, validate } from "@workertown/hono";
import { z } from "zod";

import { type FlagCondition } from "../../storage/storage-adapter.js";
import { type Context } from "../../types.js";

const router = createRouter<Context>();

function validateContext(
  context: Record<string, unknown>,
  conditions: FlagCondition[]
) {
  let result = true;

  for (const flagCondition of conditions) {
    const value = context[flagCondition.field];

    switch (flagCondition.operator) {
      case "eq":
        result = value === flagCondition.value;

        break;
      case "neq":
        result = value !== flagCondition.value;

        break;
      case "gt":
        result = Boolean(
          typeof value === "number" &&
            typeof flagCondition.value === "number" &&
            value > flagCondition.value
        );

        break;
      case "gte":
        result = Boolean(
          typeof value === "number" &&
            typeof flagCondition.value === "number" &&
            value >= flagCondition.value
        );

        break;
      case "lt":
        result = Boolean(
          typeof value === "number" &&
            typeof flagCondition.value === "number" &&
            value < flagCondition.value
        );

        break;
      case "lte":
        result = Boolean(
          typeof value === "number" &&
            typeof flagCondition.value === "number" &&
            value <= flagCondition.value
        );

        break;
      case "in":
        result =
          Array.isArray(flagCondition.value) &&
          // The `as never` is because of the array union type
          flagCondition.value.includes(value as never);

        break;
      case "nin":
        result =
          Array.isArray(flagCondition.value) &&
          // The `as never` is because of the array union type
          !flagCondition.value?.includes(value as never);

        break;
      default:
        result = false;
    }

    if (!result) {
      break;
    }
  }

  return result;
}

router.post(
  "/",
  validate(
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
        if (!flag.conditions?.length) {
          return true;
        }

        if (!context) {
          return false;
        }

        return validateContext(context, flag.conditions);
      })
      .map((flag) => flag.name);

    return ctx.json({ status: 200, success: true, data: result });
  }
);

export { router };
