import { type Server } from "@workertown/internal-server";

export async function request(
  service: Server,
  path: string,
  { body, headers = {}, ...options }: RequestInit = {},
) {
  return service.request(path, {
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  });
}
