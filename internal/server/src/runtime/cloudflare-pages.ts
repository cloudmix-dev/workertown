import { handle } from "hono/cloudflare-pages";

import { type Server } from "../server.js";

// biome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the Server here
export function serve(server: Server<any>) {
  return handle(server.server);
}
