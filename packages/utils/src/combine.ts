import { type WorkertownHono, createServer } from "@workertown/internal-hono";

// rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the the WorkertownHono server here
export function combine(...args: WorkertownHono<any>[]) {
  const server = args.reduce(
    (acc, hono) => acc.route("/", hono),
    createServer(),
  );

  return server;
}
