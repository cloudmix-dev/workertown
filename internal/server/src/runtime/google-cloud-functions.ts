import functions from "@google-cloud/functions-framework";
import { createServerAdapter } from "@whatwg-node/server";

import { type Server } from "../server.js";

// rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the Server here
export function serve(server: Server<any>) {
  const handler = createServerAdapter(server.fetch);

  return functions.http("workertown", handler);
}
