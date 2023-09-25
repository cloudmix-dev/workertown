import test from "ava";

import { authenticated } from "../../src/middleware/authenticated";
import { basic } from "../../src/middleware/basic";
import { Router } from "../../src/router";
import { makeRequest } from "../_utils";

interface SuccessfulResponse {
  success: true;
}

interface ErrorResponse {
  success: false;
  status: number;
  data: null;
  error: string;
}

test("allows authenticated requests", async (t) => {
  const router = new Router();

  router.use(
    "*",
    basic({ username: "test_username", password: "test_password" }),
    authenticated(),
  );
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(router, "/", {
    headers: {
      Authorization: `Basic ${btoa("test_username:test_password")}`,
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as SuccessfulResponse;

  t.is(result.success, true);
});

test("doesn't allow unauthenticated requests", async (t) => {
  const router = new Router();

  router.use("*", basic(), authenticated());
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(router, "/");

  t.is(res.status, 401);

  const result = (await res.json()) as ErrorResponse;

  t.is(result.status, 401);
  t.is(result.success, false);
  t.is(result.data, null);
  t.is(result.error, "Unauthorized");
});

test("gets the username/password from ctx.env correctly", async (t) => {
  const router = new Router();

  router.use("*", (ctx, next) => {
    ctx.env = ctx.env ?? {};
    // biome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
    (ctx.env as any).AUTH_USERNAME = "test_username";
    // biome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
    (ctx.env as any).AUTH_PASSWORD = "test_password";

    return next();
  });
  router.use("*", basic(), authenticated());
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(router, "/", {
    headers: {
      Authorization: `Basic ${btoa("test_username:test_password")}`,
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as SuccessfulResponse;

  t.is(result.success, true);
});

test("gets the username/password from a custom ctx.env value", async (t) => {
  const router = new Router();

  router.use("*", (ctx, next) => {
    ctx.env = ctx.env ?? {};
    // biome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
    (ctx.env as any).TEST_USERNAME = "test_username";
    // biome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
    (ctx.env as any).TEST_PASSWORD = "test_password";

    return next();
  });
  router.use(
    "*",
    basic({
      env: {
        username: "TEST_USERNAME",
        password: "TEST_PASSWORD",
      },
    }),
    authenticated(),
  );
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(router, "/", {
    headers: {
      Authorization: `Basic ${btoa("test_username:test_password")}`,
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as SuccessfulResponse;

  t.is(result.success, true);
});
