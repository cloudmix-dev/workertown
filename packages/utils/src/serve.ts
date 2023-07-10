import { serve as honoServe } from "@hono/node-server";
import { type Hono } from "hono";

interface ServeOptions {
  port?: number;
  hostname?: string;
}

export function serve(server: Hono, options: ServeOptions) {
  return honoServe({ fetch: server.fetch, ...options });
}
