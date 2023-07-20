import test from "ava";
import { Hono } from "hono";

import { apiKey } from "../../src/middleware/api-key";
import { authenticated } from "../../src/middleware/authenticated";
import { makeRequest } from "../_utils";

test("allows authenticated requests", async (t) => {
  const server = new Hono<{ Variables: { user: { id: string } } }>();

  server.use("*", apiKey({ apiKey: "test" }));
  server.use("*", authenticated());
  server.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(server, "/", {
    headers: {
      authorization: "Bearer test",
    },
  });

  t.is(res.status, 200);

  const result = await res.json();

  t.is(result.success, true);
});

test("doesn't allow unauthenticated requests", async (t) => {
  const server = new Hono();

  server.use("*", apiKey());
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

test("gets the API key from ctx.env correctly", async (t) => {
  const server = new Hono<{ Variables: { user: { id: string } } }>();

  server.use("*", (ctx, next) => {
    ctx.env = ctx.env ?? {};
    // rome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
    (ctx.env as any).AUTH_API_KEY = "test";

    return next();
  });
  server.use("*", apiKey());
  server.use("*", authenticated());
  server.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(server, "/", {
    headers: {
      authorization: "Bearer test",
    },
  });

  t.is(res.status, 200);

  const result = await res.json();

  t.is(result.success, true);
});

test("gets the API key from a custom ctx.env value", async (t) => {
  const server = new Hono<{ Variables: { user: { id: string } } }>();

  server.use("*", (ctx, next) => {
    ctx.env = ctx.env ?? {};
    // rome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
    (ctx.env as any).TEST_API_KEY = "test";

    return next();
  });
  server.use(
    "*",
    apiKey({
      env: {
        apiKey: "TEST_API_KEY",
      },
    }),
  );
  server.use("*", authenticated());
  server.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(server, "/", {
    headers: {
      authorization: "Bearer test",
    },
  });

  t.is(res.status, 200);

  const result = await res.json();

  t.is(result.success, true);
});
