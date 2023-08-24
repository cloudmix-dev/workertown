import { serve as honoServe } from "@hono/node-server";
import { type Server } from "@workertown/internal-server";

const { PORT = "3000" } = process.env;

interface ServeOptions {
  port?: number;
  hostname?: string;
}

export function serve(
  server: Server,
  options: ServeOptions = { port: parseInt(PORT, 10) },
) {
  return honoServe({ fetch: server.fetch, ...options });
}
