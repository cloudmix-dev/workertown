import test from "ava";
import { Hono } from "hono";

import { authenticated } from "../../src/middleware/authenticated";
import { makeRequest } from "../_utils";

test("allows authenticated requests", async (t) => {
  const server = new Hono<{ Variables: { user: { id: string } } }>();

  server.use("*", (ctx, next) => {
    ctx.set("user", { id: "test" });

    return next();
  });
  server.use("*", authenticated());
  server.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(server, "/");

  t.is(res.status, 200);

  const result = await res.json();

  t.is(result.success, true);
});

test("doesn't allow unauthenticated requests", async (t) => {
  const server = new Hono();

  server.use("*", authenticated());
  server.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(server, "/");

  t.is(res.status, 403);

  const result = await res.json();

  t.is(result.status, 403);
  t.is(result.success, false);
  t.is(result.data, null);
  t.is(result.error, "Forbidden");
});
