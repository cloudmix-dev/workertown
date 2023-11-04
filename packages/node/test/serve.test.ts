import { Server } from "node:http";
import { createServer } from "@workertown/internal-server";
import test from "ava";

import { serve } from "../src/serve";

test("serve", (t) => {
  const server = createServer();
  const nodeServer = serve(server);

  t.assert(nodeServer instanceof Server);

  nodeServer.close();
});

test("serve w/ options", (t) => {
  const server = createServer();
  // We're just checking it still runs, as @hono/node-server is handling the
  // passed in options
  const nodeServer = serve(server, { port: 8080, hostname: "test.local" });

  t.assert(nodeServer instanceof Server);

  nodeServer.close();
});
