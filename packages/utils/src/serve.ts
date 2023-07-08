import { serve as honoServe } from "@hono/node-server";
import { type Hono } from "hono";

interface ServeOptions {
  fetch: Hono["fetch"];
  port?: number;
  hostname?: string;
}

export function serve(options: ServeOptions) {
  return honoServe(options);
}
