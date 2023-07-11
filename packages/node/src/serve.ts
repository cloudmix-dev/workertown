import { serve as honoServe } from "@hono/node-server";
import { type WorkertownHono } from "@workertown/hono";

interface ServeOptions {
  port?: number;
  hostname?: string;
}

export function serve(server: WorkertownHono<any>, options: ServeOptions) {
  return honoServe({ fetch: server.fetch, ...options });
}
