import { createRouter } from "@workertown/internal-hono";

import { type Context } from "../../types.js";

const router = createRouter<Context>({ public: true });

router.get("/open-api.json", (ctx) => {
  return ctx.json({});
});

router.get("/health", async (ctx) =>
  ctx.json({ status: 200, success: true, data: "OK" })
);

export { router };
