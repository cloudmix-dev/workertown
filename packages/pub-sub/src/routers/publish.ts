import { createRouter, validate } from "@workertown/hono";
import { z } from "zod";

import { ContextBindings } from "../types";

const router = createRouter<ContextBindings>();

const publish = router.post(
  "/:topic",
  validate(
    "json",
    z.object({
      message: z.record(z.any(), z.unknown()).optional(),
    })
  ),
  async (ctx) => {
    const storage = ctx.get("storage");
    const queue = ctx.get("queue");
    const topic = ctx.req.param("topic");
    const { message } = ctx.req.valid("json");
    const subscriptions = await storage.getSubscriptionsByTopic(topic);
    const messages = subscriptions.map((subscription) => ({
      topic: subscription.topic,
      endpoint: subscription.endpoint,
      headers: subscription.headers ?? undefined,
      queryParameters: subscription.queryParameters ?? undefined,
      body: message ?? undefined,
    }));

    await queue.sendMessages(messages.map((message) => ({ message })));

    return ctx.jsonT({ status: 200, success: true, data: true });
  }
);

export type PublishRoute = typeof publish;

export { router };
