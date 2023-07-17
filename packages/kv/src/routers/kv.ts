import { createRouter, validate } from "@workertown/internal-hono";
import { z } from "zod";

import { type Context } from "../types.js";

const router = createRouter<Context>();

router.get("/*", async (ctx) => {
  const config = ctx.get("config");
  const storage = ctx.get("storage");
  const { kv: kvPrefix } = config.prefixes;
  const url = new URL(ctx.req.url);
  const key = url.pathname.replace(kvPrefix, "");
  const value = await storage.getValue(key);

  return ctx.json({ status: 200, success: true, data: value });
});

router.put(
  "/*",
  validate(
    "json",
    z.object({
      value: z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.record(z.string(), z.unknown()),
        z.array(z.unknown()),
      ]),
    })
  ),
  async (ctx) => {
    const config = ctx.get("config");
    const storage = ctx.get("storage");
    const { value } = ctx.req.valid("json");
    const { kv: kvPrefix } = config.prefixes;
    const url = new URL(ctx.req.url);
    const key = url.pathname.replace(kvPrefix, "");

    await storage.setValue(key, value);

    return ctx.json({ status: 200, success: true, data: value as any });
  }
);

router.delete("/*", async (ctx) => {
  const config = ctx.get("config");
  const storage = ctx.get("storage");
  const { kv: kvPrefix } = config.prefixes;
  const url = new URL(ctx.req.url);
  const key = url.pathname.replace(kvPrefix, "");

  await storage.deleteValue(key);

  return ctx.json({ status: 200, success: true, data: true });
});

export { router };
