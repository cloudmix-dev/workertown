import { createRouter, validate } from "@workertown/internal-server";
import { z } from "zod";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

function getKey(req: Request, config: Context["config"]) {
  const { kv: kvPrefix } = config.endpoints.v1;
  const url = new URL(req.url);
  const key = url.pathname.replace(kvPrefix as string, "").replace(/^\//, "");

  return key;
}

router.get("/*", async (ctx) => {
  const config = ctx.get("config");
  const storage = ctx.get("storage");
  const key = getKey(ctx.req as unknown as Request, config);
  const value = await storage.getValue(key);
  const status = value === null ? 404 : 200;

  return ctx.json({ status, success: true, data: value }, status);
});

const createKvBodySchema = z.object({
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.record(z.string(), z.unknown()),
    z.array(z.unknown()),
  ]),
});

router.put("/*", validate("json", createKvBodySchema), async (ctx) => {
  const config = ctx.get("config");
  const storage = ctx.get("storage");
  const { value } = ctx.req.valid("json" as never) as z.infer<
    typeof createKvBodySchema
  >;
  const key = getKey(ctx.req as unknown as Request, config);

  await storage.setValue(key, value);

  return ctx.json({ status: 200, success: true, data: value });
});

router.delete("/*", async (ctx) => {
  const config = ctx.get("config");
  const storage = ctx.get("storage");
  const key = getKey(ctx.req as unknown as Request, config);

  await storage.deleteValue(key);

  return ctx.json({ status: 200, success: true, data: true });
});

export { router };
