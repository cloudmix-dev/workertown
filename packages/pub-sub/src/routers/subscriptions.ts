import { zValidator } from "@hono/zod-validator";
import { createRouter } from "@workertown/hono";
import { z } from "zod";

import { Subscription } from "../storage";
import { ContextBindings } from "../types";

const router = createRouter<ContextBindings>();

const getSubscriptions = router.get(
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

    return ctx.jsonT({ status: 200, success: true, data: subscriptions });
  }
);

export type GetSubscriptionsRoute = typeof getSubscriptions;

const createSubscription = router.post(
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

    return ctx.jsonT(
      { status, success: subscription ? true : null, data: subscription },
      status
    );
  }
);

export type CreateSubscriptionRoute = typeof createSubscription;

const deleteSubscription = router.delete("/:id", async (ctx) => {
  const storage = ctx.get("storage");
  const id = ctx.req.param("id");

  await storage.deleteSubscription(id);

  return ctx.jsonT({ status: 200, success: true, data: true });
});

export type DeleteSubscriptionRoute = typeof deleteSubscription;

export { router };
