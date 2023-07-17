import { type WorkertownHono, createServer } from "@workertown/internal-hono";

export function combine(...args: WorkertownHono<any>[]) {
  const server = args.reduce(
    (acc, hono) => acc.route("/", hono),
    createServer()
  );

  return server;
}
