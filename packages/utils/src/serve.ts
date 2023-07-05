import { serve as honoServe } from "@hono/node-server";
import { type Hono } from "hono";

export function serve(hono: Hono) {
  return honoServe(hono);
}
