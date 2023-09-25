import kv, { type ServerOptions } from "../src";
import { runtime } from "../src/runtime/test";

const VALUES = {
  "test/1": "test",
  "test/2": {
    test: true,
  },
};

export function createTestService(
  options: ServerOptions = {},
  initialValues: Record<string, unknown> = VALUES,
) {
  return kv({
    ...options,
    auth: { apiKey: { apiKey: "test" } },
    logger: false,

    runtime: (config, env) => runtime(config, env, { initialValues }),
  });
}

export function makeRequest(
  service: ReturnType<typeof kv>,
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
