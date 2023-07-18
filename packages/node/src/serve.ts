import { serve as honoServe } from "@hono/node-server";
import { type WorkertownHono } from "@workertown/internal-hono";

interface ServeOptions {
  port?: number;
  hostname?: string;
}

export function serve(
  // rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the the WorkertownHono server here
  server: WorkertownHono<any>,
  options: ServeOptions = { port: 3000 },
) {
  return honoServe({ fetch: server.fetch, ...options });
}
