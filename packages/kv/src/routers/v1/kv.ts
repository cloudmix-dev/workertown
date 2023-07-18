import {
  type WorkertownRequest,
  createRouter,
  validate,
} from "@workertown/internal-hono";
import { z } from "zod";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

function getKey(
  req: WorkertownRequest<"/*">,
  config: Context["Variables"]["config"],
) {
  const { kv: kvPrefix } = config.endpoints.v1;
  const url = new URL(req.url);
  const key = url.pathname.replace(kvPrefix, "").replace(/^\//, "");

  return key;
}

router.get("/*", async (ctx) => {
  const config = ctx.get("config");
  const storage = ctx.get("storage");
  const key = getKey(ctx.req, config);
  const value = await storage.getValue(key);
  const status = value === null ? 404 : 200;

  return ctx.json({ status, success: true, data: value }, status);
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
    }),
  ),
  async (ctx) => {
    const config = ctx.get("config");
    const storage = ctx.get("storage");
    const { value } = ctx.req.valid("json");
    const key = getKey(ctx.req, config);

    await storage.setValue(key, value);

    return ctx.json({ status: 200, success: true, data: value });
  },
);

router.delete("/*", async (ctx) => {
  const config = ctx.get("config");
  const storage = ctx.get("storage");
  const key = getKey(ctx.req, config);

  await storage.deleteValue(key);

  return ctx.json({ status: 200, success: true, data: true });
});

export { router };
