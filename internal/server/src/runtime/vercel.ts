import { handle } from "hono/vercel";

import { type Server } from "../server.js";

// rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the Server here
export function serve(server: Server<any>) {
  return handle(server);
}
