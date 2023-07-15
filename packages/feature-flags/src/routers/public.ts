import { createRouter } from "@workertown/hono";

import { type Context } from "../types.js";

const router = createRouter<Context>({ public: true });

router.get("/open-api.json", (ctx) => {
  const { prefixes } = ctx.get("config");

  return ctx.jsonT({ prefixes });
});

router.get("/health", async (ctx) =>
  ctx.json({ status: 200, success: true, data: "OK" })
);

export { router };
