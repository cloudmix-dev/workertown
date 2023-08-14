import test from "ava";

import { createTestService, makeRequest } from "./_utils";

interface SuccessfulResponse {
  status: 200;
  success: true;
}

// KV
interface KVGetResponse extends SuccessfulResponse {
  data: unknown;
}

interface KVSetResponse extends SuccessfulResponse {
  data: unknown;
}

interface KVDeleteResponse extends SuccessfulResponse {
  data: true;
}

test("v1 kv get", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/kv/test/1");

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as KVGetResponse;

  t.is(result1.data, "test");

  const res2 = await makeRequest(service, "/v1/kv/test/2");

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as KVGetResponse;

  t.is((result2.data as { test: boolean }).test, true);
});

test("v1 kv set", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/kv/test/1", {
    method: "PUT",
    body: { value: "other" },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as KVSetResponse;

  t.is(result1.data, "other");

  const res2 = await makeRequest(service, "/v1/kv/test/1");

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as KVGetResponse;

  t.is(result2.data, "other");
});

test("v1 kv delete", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/kv/test/1", {
    method: "DELETE",
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as KVDeleteResponse;

  t.is(result1.data, true);

  const res2 = await makeRequest(service, "/v1/kv/test/1");

  t.is(res2.status, 404);

  const result2 = (await res2.json()) as KVGetResponse;

  t.is(result2.data, null);
});

// Admin
interface AdminInfoResponse extends SuccessfulResponse {
  data: {
    endpoints: {
      v1: {
        kv: string;
      };
    };
  };
}

interface AdminMigrateResponse extends SuccessfulResponse {
  data: true;
}

test("v1 admin info", async (t) => {
  const service = createTestService({
    endpoints: {
      v1: {
        kv: "/custom-kv",
      },
    },
  });
  const res = await makeRequest(service, "/v1/admin/info");

  t.is(res.status, 200);

  const result = (await res.json()) as AdminInfoResponse;

  t.is(result.data.endpoints.v1.kv, "/custom-kv");
});

test("v1 admin migrate", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/admin/migrate", {
    method: "POST",
  });

  t.is(res.status, 200);

  const result = (await res.json()) as AdminMigrateResponse;

  t.deepEqual(result.data, []);
});

test("v1 admin w/ custom endpoint", async (t) => {
  const service = createTestService({
    endpoints: {
      v1: {
        admin: "/custom-admin",
        kv: "/custom-kv",
      },
    },
  });
  const res = await makeRequest(service, "/custom-admin/info");

  t.is(res.status, 200);

  const result = (await res.json()) as AdminInfoResponse;

  t.is(result.data.endpoints.v1.kv, "/custom-kv");
});

// Public
interface PublicResponse {
  openapi: "3.0.0";
}

test("v1 public open-api.json", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/open-api.json");

  t.is(res.status, 200);

  const result = (await res.json()) as PublicResponse;

  t.is(result.openapi, "3.0.0");
});

test("v1 public w/ custom endpoint", async (t) => {
  const service = createTestService({
    endpoints: {
      public: "/custom-public",
    },
  });
  const res = await makeRequest(service, "/custom-public/open-api.json");

  t.is(res.status, 200);

  const result = (await res.json()) as PublicResponse;

  t.is(result.openapi, "3.0.0");
});
