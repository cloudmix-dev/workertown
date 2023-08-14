import { createRouter, validate } from "@workertown/internal-hono";
import { z } from "zod";

import { type Subscription } from "../../storage/index.js";
import { type Context } from "../../types.js";

const router = createRouter<Context>();

router.get(
  "/",
  validate(
    "query",
    z.object({
      topic: z.string().optional(),
    }),
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
  },
);

router.post(
  "/",
  validate(
    "json",
    z.object({
      topic: z.string(),
      endpoint: z.string().url(),
      method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("POST"),
      headers: z.record(z.string(), z.string()).optional(),
      queryParameters: z.record(z.string(), z.string()).optional(),
    }),
  ),
  async (ctx) => {
    const storage = ctx.get("storage");
    const { topic, endpoint, method, headers, queryParameters } =
      ctx.req.valid("json");
    const subscription = await storage.createSubscription({
      topic,
      endpoint,
      method,
      headers,
      queryParameters,
    });

    return ctx.json({ status: 200, success: true, data: subscription });
  },
);

router.delete("/:id", async (ctx) => {
  const storage = ctx.get("storage");
  const id = ctx.req.param("id");

  await storage.deleteSubscription(id);

  return ctx.json({
    status: 200,
    success: true,
    data: {
      id,
    },
  });
});

export { router };
