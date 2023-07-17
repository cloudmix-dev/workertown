import { createRouter } from "@workertown/internal-hono";

import { OPEN_API_SPEC } from "../../constants.js";
import { type Context } from "../../types.js";

const router = createRouter<Context>({ public: true });

router.get("/open-api.json", (ctx) => {
  return ctx.json(OPEN_API_SPEC);
});

router.get("/health", async (ctx) =>
  ctx.json({ status: 200, success: true, data: "OK" })
);

export { router };
