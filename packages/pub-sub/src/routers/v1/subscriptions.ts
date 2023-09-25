import { createRouter, validate } from "@workertown/internal-server";
import { z } from "zod";

import { type Subscription } from "../../storage/index.js";
import { type Context } from "../../types.js";

const router = createRouter<Context>();

const getSubscriptionsQuerySchema = z.object({
  topic: z.string().optional(),
});

router.get("/", validate("query", getSubscriptionsQuerySchema), async (ctx) => {
  const storage = ctx.get("storage");
  const { topic } = ctx.req.valid("query" as never) as z.infer<
    typeof getSubscriptionsQuerySchema
  >;
  let subscriptions: Subscription[];

  if (topic) {
    subscriptions = await storage.getSubscriptionsByTopic(topic);
  } else {
    subscriptions = await storage.getSubscriptions();
  }

  return ctx.json({ status: 200, success: true, data: subscriptions });
});

const createSubscriptionBodySchema = z.object({
  topic: z.string(),
  endpoint: z.string().url(),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).default("POST"),
  headers: z.record(z.string(), z.string()).optional(),
  queryParameters: z.record(z.string(), z.string()).optional(),
});

router.post(
  "/",
  validate("json", createSubscriptionBodySchema),
  async (ctx) => {
    const storage = ctx.get("storage");
    const { topic, endpoint, method, headers, queryParameters } = ctx.req.valid(
      "json" as never,
    ) as z.infer<typeof createSubscriptionBodySchema>;
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
