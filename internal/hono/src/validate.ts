import { zValidator } from "@hono/zod-validator";
import { type Env as HonoEnv, type ValidationTargets } from "hono";
import {
  type ZodType,
  type ZodTypeDef,
  type input as ZodInput,
  type output as ZodOutput,
} from "zod";

// This is just a dumb copy/paste (and modification) of the types found at
// @hono/zod-validator/dist/esm/index.d.ts
export const validate = <
  Env extends HonoEnv,
  // rome-ignore lint/suspicious/noExplicitAny: We're just copy/pasting the types from zod-validator
  T extends ZodType<any, ZodTypeDef, any>,
  Target extends keyof ValidationTargets,
  P extends string,
  V extends {
    in: { [K in Target]: ZodInput<T> };
    out: { [K_1 in Target]: ZodOutput<T> };
  } = {
    in: { [K_2 in Target]: ZodInput<T> };
    out: { [K_3 in Target]: ZodOutput<T> };
  },
>(
  input: Target,
  schema: T,
) =>
  zValidator<T, Target, Env, P, V>(input, schema, (result, ctx) => {
    if (!result.success) {
      return ctx.json(
        {
          status: 400,
          success: false,
          data: null,
          errors: result.error.issues.map((issue) => ({
            location: input === "json" ? "body" : "query",
            path: issue.path,
            message: issue.message,
          })),
        },
        400,
      );
    }

    return result.data;
  });
