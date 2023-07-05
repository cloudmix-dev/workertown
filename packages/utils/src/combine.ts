import { Hono } from "hono";

export function combine(...args: Hono[]) {
  return args.reduce((acc, hono) => acc.route("/", hono), new Hono());
}
