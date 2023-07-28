import { type WorkertownHono } from "@workertown/internal-hono";

export async function request(
  // rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the the WorkertownHono server here
  service: WorkertownHono<any>,
  path: string,
  { body, headers = {}, ...options }: RequestInit = {},
) {
  return service.fetch(
    new Request(`http://service.local${path}`, {
      headers: {
        "content-type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),
  );
}
