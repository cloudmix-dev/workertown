import { type WorkertownHono, createServer } from "@workertown/hono";

export function combine(...args: WorkertownHono<any>[]) {
  const server = args.reduce(
    (acc, hono) => acc.route("/", hono),
    createServer()
  );

  return server;
}
