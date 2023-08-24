import { createRouter, validate } from "@workertown/internal-server";
import { z } from "zod";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

router.post(
  "/:topic",
  validate(
    "json",
    z.object({
      message: z.record(z.any(), z.unknown()).optional(),
    }),
  ),
  async (ctx) => {
    const storage = ctx.get("storage");
    const queue = ctx.get("queue");
    const topic = ctx.req.param("topic");
    const { message } = ctx.req.valid("json");
    const subscriptions = await storage.getSubscriptionsByTopic(topic);
    const queueMessages = subscriptions.map((subscription) => ({
      topic: subscription.topic,
      endpoint: subscription.endpoint,
      headers: subscription.headers ?? undefined,
      queryParameters: subscription.queryParameters ?? undefined,
      body: message ?? undefined,
    }));

    if (queueMessages.length > 0) {
      await queue.sendMessages(queueMessages);
    }

    return ctx.json({ status: 200, success: true, data: true });
  },
);

export { router };
