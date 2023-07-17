import { serve as honoServe } from "@hono/node-server";
import { type WorkertownHono } from "@workertown/internal-hono";

interface ServeOptions {
  port?: number;
  hostname?: string;
}

export function serve(
  server: WorkertownHono<any>,
  options: ServeOptions = { port: 3000 }
) {
  return honoServe({ fetch: server.fetch, ...options });
}
