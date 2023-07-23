import { handle } from "hono/vercel";

import { type WorkertownHono } from "../create-server.js";

// rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the the WorkertownHono server here
export function serve(server: WorkertownHono<any>) {
  return handle(server);
}
