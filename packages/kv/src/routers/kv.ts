import { zValidator } from "@hono/zod-validator";
import { authenticated } from "@workertown/middleware";
import { Hono } from "hono";
import { z } from "zod";

import { ContextBindings } from "../types";

const router = new Hono<ContextBindings>();

router.use("*", authenticated());

const getKv = router.get("/*", async (ctx) => {
  const config = ctx.get("config");
  const storage = ctx.get("storage");
  const { kv: kvPrefix } = config.prefixes;
  const url = new URL(ctx.req.url);
  const key = url.pathname.replace(kvPrefix, "");
  const value = await storage.getValue(key);

  return ctx.jsonT({ status: 200, success: true, data: value });
});

export type GetKvRoute = typeof getKv;

const setKv = router.put(
  "/*",
  zValidator("json", z.object({ value: z.any() })),
  async (ctx) => {
    const config = ctx.get("config");
    const storage = ctx.get("storage");
    const { value } = ctx.req.valid("json");
    const { kv: kvPrefix } = config.prefixes;
    const url = new URL(ctx.req.url);
    const key = url.pathname.replace(kvPrefix, "");

    await storage.setValue(key, value);

    return ctx.jsonT({ status: 200, success: true, data: value });
  }
);

export type SetKvRoute = typeof setKv;

const deleteKv = router.delete("/*", async (ctx) => {
  const config = ctx.get("config");
  const storage = ctx.get("storage");
  const { kv: kvPrefix } = config.prefixes;
  const url = new URL(ctx.req.url);
  const key = url.pathname.replace(kvPrefix, "");

  await storage.deleteValue(key);

  return ctx.jsonT({ status: 200, success: true, data: true });
});

export type DeleteKvRoute = typeof deleteKv;

export { router };
