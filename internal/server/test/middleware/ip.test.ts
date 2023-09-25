import test from "ava";

import { ip } from "../../src/middleware/ip";
import { Router } from "../../src/router";
import { makeRequest } from "../_utils";

interface SuccessfulResponse {
  success: true;
}

interface ErrorResponse {
  data: null;
  error: "Forbidden";
  status: 403;
  success: false;
}

test("only allows requests from whitelisted IPv4s", async (t) => {
  const router = new Router();

  router.use("*", ip({ ips: ["10.0.0.0/24", "11.0.0.0"] }));
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res1 = await makeRequest(router, "/", {
    headers: {
      "cf-connecting-ip": "10.0.0.0",
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as SuccessfulResponse;

  t.is(result1.success, true);

  const res2 = await makeRequest(router, "/", {
    headers: {
      "cf-connecting-ip": "11.0.0.0",
    },
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as SuccessfulResponse;

  t.is(result2.success, true);

  const res3 = await makeRequest(router, "/", {
    headers: {
      "cf-connecting-ip": "11.0.0.1",
    },
  });

  t.is(res3.status, 403);

  const result3 = (await res3.json()) as ErrorResponse;

  t.is(result3.status, 403);
  t.is(result3.success, false);
  t.is(result3.data, null);
  t.is(result3.error, "Forbidden");
});

test("only allows requests from whitelisted IPv6s", async (t) => {
  const router = new Router();

  router.use("*", ip({ ips: ["2001:db8::/24", "2001:4860:8006::62"] }));
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res1 = await makeRequest(router, "/", {
    headers: {
      "cf-connecting-ip": "2001:db8:1234::1",
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as SuccessfulResponse;

  t.is(result1.success, true);

  const res2 = await makeRequest(router, "/", {
    headers: {
      "cf-connecting-ip": "2001:4860:8006::62",
    },
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as SuccessfulResponse;

  t.is(result2.success, true);

  const res3 = await makeRequest(router, "/", {
    headers: {
      "cf-connecting-ip": "2001:4860:8006::63",
    },
  });

  t.is(res3.status, 403);

  const result3 = (await res3.json()) as ErrorResponse;

  t.is(result3.status, 403);
  t.is(result3.success, false);
  t.is(result3.data, null);
  t.is(result3.error, "Forbidden");
});

test("gets the IP correctly", async (t) => {
  const router = new Router();

  router.use("*", ip({ ips: ["10.0.0.0/24"] }));
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res1 = await makeRequest(router, "/", {
    headers: {
      "cf-connecting-ip": "10.0.0.0",
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as SuccessfulResponse;

  t.is(result1.success, true);

  const res2 = await makeRequest(router, "/", {
    headers: {
      "x-forwarded-for": "10.0.0.0",
    },
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as SuccessfulResponse;

  t.is(result2.success, true);

  const res3 = await makeRequest(router, "/", {
    headers: {
      "x-real-ip": "10.0.0.0",
    },
  });

  t.is(res3.status, 200);

  const result3 = (await res3.json()) as SuccessfulResponse;

  t.is(result3.success, true);
});

test("allows requests from nowhere by default", async (t) => {
  const router = new Router();

  router.use("*", ip());
  router.get("*", (ctx) => {
    return ctx.json({ success: true });
  });

  const res = await makeRequest(router, "/", {
    headers: {
      "cf-connecting-ip": "10.0.0.0",
    },
  });

  t.is(res.status, 403);

  const result = (await res.json()) as ErrorResponse;

  t.is(result.status, 403);
  t.is(result.success, false);
  t.is(result.data, null);
  t.is(result.error, "Forbidden");
});
