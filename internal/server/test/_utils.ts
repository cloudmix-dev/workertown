import { Router } from "../src/router";
import { type Server } from "../src/server";

export function makeRequest(
  // biome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the Hono server here
  service: Server<any> | Router<any>,
  path: string,
  {
    method = "GET",
    body,
    headers = {},
  }: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
) {
  const req = {
    method,
    headers: {
      Authorization: "Bearer test",
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  };
  if (service instanceof Router) {
    return service.router.request(path, req);
  }

  return service.request(path, req);
}
