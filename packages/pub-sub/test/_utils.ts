import pubSub, { type ServerOptions } from "../src";
import { runtime } from "../src/runtime/test";
import { type Subscription } from "../src/storage";

const SUBSCRIPTIONS: Subscription[] = [
  {
    id: "e29e3cf3-36aa-435a-a3dd-545d788f2830",
    topic: "TEST",
    endpoint: "http://localhost:3000",
    method: "GET",
    createdAt: new Date(),
  },
];

export function createTestService(
  options: ServerOptions = {},
  initialSubscriptions: Subscription[] = SUBSCRIPTIONS,
) {
  return pubSub({
    ...options,
    auth: { apiKey: { apiKey: "test" } },
    logger: false,
    runtime: (config, env) =>
      runtime(config, env, {
        initialSubscriptions: initialSubscriptions,
      }),
  });
}

export function makeRequest(
  service: ReturnType<typeof pubSub>,
  path: string,
  {
    method = "GET",
    body,
  }: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown } = {},
) {
  return service.request(path, {
    method,
    headers: {
      Authorization: "Bearer test",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
