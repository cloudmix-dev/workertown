import { type Hono, serve as honoServe } from "@workertown/hono";

interface ServeOptions {
  port?: number;
  hostname?: string;
}

export function serve(server: Hono, options: ServeOptions) {
  return honoServe({ fetch: server.fetch, ...options });
}
