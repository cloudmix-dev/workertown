import { createServer } from "@workertown/internal-server";
import test from "ava";
import { Server } from "node:http";

import { serve } from "../src/serve";

test("serve", (t) => {
  const server = createServer();
  const nodeServer = serve(server);

  t.true(nodeServer instanceof Server);

  nodeServer.close();
});

test("serve w/ options", (t) => {
  const server = createServer();
  // We're just checking it still runs, as @hono/node-server is handling the
  // passed in options
  const nodeServer = serve(server, { port: 8080, hostname: "test.local" });

  t.true(nodeServer instanceof Server);

  nodeServer.close();
});
