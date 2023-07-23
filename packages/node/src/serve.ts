import { serve as honoServe } from "@hono/node-server";
import { type WorkertownHono } from "@workertown/internal-hono";

const { PORT = "3000" } = process.env;

interface ServeOptions {
  port?: number;
  hostname?: string;
}

export function serve(
  // rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the the WorkertownHono server here
  server: WorkertownHono<any>,
  options: ServeOptions = { port: parseInt(PORT, 10) },
) {
  return honoServe({ fetch: server.fetch, ...options });
}
