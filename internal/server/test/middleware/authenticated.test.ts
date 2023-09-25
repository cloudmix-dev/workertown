import test from "ava";

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
  const router = new Router<{ user: { id: string } }>();

  router.use("*", (ctx, next) => {
    ctx.set("user", { id: "test" });

    return next();
  });
  router.use("*", authenticated());
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(router, "/");

  t.is(res.status, 200);

  const result = (await res.json()) as SuccessfulResponse;

  t.is(result.success, true);
});

test("doesn't allow unauthenticated requests", async (t) => {
  const router = new Router();

  router.use("*", authenticated());
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
