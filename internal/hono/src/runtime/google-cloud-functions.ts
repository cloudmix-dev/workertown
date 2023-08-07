import functions from "@google-cloud/functions-framework";
import { createServerAdapter } from "@whatwg-node/server";

import { type WorkertownHono } from "../create-server.js";

// rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the the WorkertownHono server here
export function serve(server: WorkertownHono<any>) {
  const handler = createServerAdapter(server.fetch);

  return functions.http("workertown", handler);
}
