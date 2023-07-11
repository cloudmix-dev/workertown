import { type Hono, createServer } from "@workertown/hono";

export function combine(...args: Hono[]) {
  const server = args.reduce(
    (acc, hono) => acc.route("/", hono),
    createServer()
  );

  return server;
}
