import search, { type CreateServerOptions } from "../src";
import { runtime } from "../src/runtime/test";

const VALUES = {
  "test/1": "test",
  "test/2": {
    test: true,
  },
};

export function createTestService(
  options: CreateServerOptions = {},
  initialValues: Record<string, unknown> = VALUES,
) {
  return search({
    ...options,
    auth: { apiKey: { apiKey: "test" } },
    logger: false,
    runtime: (config, env) => runtime(config, env, { initialValues }),
  });
}

export function makeRequest(
  service: ReturnType<typeof search>,
  path: string,
  {
    method = "GET",
    body,
  }: { method?: "GET" | "POST" | "PUT" | "DELETE"; body?: unknown } = {},
) {
  return service.fetch(
    new Request(`http://search.local${path}`, {
      method,
      headers: {
        authorization: "Bearer test",
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
}
