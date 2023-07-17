import { zValidator } from "@hono/zod-validator";
import { createRouter } from "@workertown/internal-hono";
import { z } from "zod";

import { type Subscription } from "../../storage/index.js";
import { type Context } from "../../types.js";

const router = createRouter<Context>();

router.get(
  "/",
  zValidator(
    "query",
    z.object({
      topic: z.string().optional(),
    })
  ),
  async (ctx) => {
    const storage = ctx.get("storage");
    const { topic } = ctx.req.valid("query");
    let subscriptions: Subscription[];

    if (topic) {
      subscriptions = await storage.getSubscriptionsByTopic(topic);
    } else {
      subscriptions = await storage.getSubscriptions();
    }

    return ctx.json({ status: 200, success: true, data: subscriptions });
  }
);

router.post(
  "/",
  zValidator(
    "json",
    z.object({
      topic: z.string(),
      endpoint: z.string().url(),
      headers: z.record(z.string(), z.string()).optional(),
      queryParameters: z.record(z.string(), z.string()).optional(),
    })
  ),
  async (ctx) => {
    const storage = ctx.get("storage");
    const { topic, endpoint, headers, queryParameters } = ctx.req.valid("json");
    let subscription: Subscription | null = null;

    try {
      subscription = await storage.createSubscription({
        topic,
        endpoint,
        headers,
        queryParameters,
      });
    } catch (_) {}

    const status = subscription ? 200 : 400;

    return ctx.json(
      { status, success: subscription ? true : null, data: subscription },
      status
    );
  }
);

router.delete("/:id", async (ctx) => {
  const storage = ctx.get("storage");
  const id = ctx.req.param("id");

  await storage.deleteSubscription(id);

  return ctx.json({ status: 200, success: true, data: true });
});

export { router };
