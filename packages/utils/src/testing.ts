import { type Server } from "@workertown/internal-server";

export async function request(
  service: Server,
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
