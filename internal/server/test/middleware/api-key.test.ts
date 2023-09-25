import test from "ava";

import { apiKey } from "../../src/middleware/api-key";
import { authenticated } from "../../src/middleware/authenticated";
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

  router.use("*", apiKey({ apiKey: "test" }), authenticated());
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(router, "/", {
    headers: {
      Authorization: "Bearer test",
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as SuccessfulResponse;

  t.is(result.success, true);
});

test("doesn't allow unauthenticated requests", async (t) => {
  const router = new Router();

  router.use("*", apiKey(), authenticated());
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

test("gets the API key from ctx.env correctly", async (t) => {
  const router = new Router();

  router.use("*", (ctx, next) => {
    ctx.env = ctx.env ?? {};
    // biome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
    (ctx.env as any).AUTH_API_KEY = "test";

    return next();
  });
  router.use("*", apiKey(), authenticated());
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(router, "/", {
    headers: {
      Authorization: "Bearer test",
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as SuccessfulResponse;

  t.is(result.success, true);
});

test("gets the API key from a custom ctx.env value", async (t) => {
  const router = new Router();

  router.use("*", (ctx, next) => {
    ctx.env = ctx.env ?? {};
    // biome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
    (ctx.env as any).TEST_API_KEY = "test";

    return next();
  });
  router.use(
    "*",
    apiKey({
      env: {
        apiKey: "TEST_API_KEY",
      },
    }),
    authenticated(),
  );
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(router, "/", {
    headers: {
      Authorization: "Bearer test",
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as SuccessfulResponse;

  t.is(result.success, true);
});
