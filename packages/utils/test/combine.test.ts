import { createRouter, createServer } from "@workertown/internal-server";
import test from "ava";

import { combine } from "../src/combine";

interface TestResponse {
  success: true;
}

test("combine", async (t) => {
  const router1 = createRouter();
  const router2 = createRouter();

  router1.get("/server-1/test", async (ctx) => ctx.json({ success: true }));
  router2.get("/server-2/test", async (ctx) => ctx.json({ success: true }));

  const server1 = createServer({ logger: false });
  const server2 = createServer({ logger: false });

  server1.route("/", router1);
  server2.route("/", router2);

  const combined = combine(server1, server2);

  const res1 = await combined.fetch(
    new Request("http://test.local/server-1/test"),
  );
  const res2 = await combined.fetch(
    new Request("http://test.local/server-2/test"),
  );

  const response1 = (await res1.json()) as TestResponse;
  const response2 = (await res2.json()) as TestResponse;

  t.is(response1.success, true);
  t.is(response2.success, true);
});
