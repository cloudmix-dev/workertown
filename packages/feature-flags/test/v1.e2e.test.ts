import test from "ava";

import { type Flag } from "../src/storage";
import { createTestService, makeRequest } from "./_utils";

interface SuccessfulResponse {
  status: 200;
  success: true;
}

// Flags
interface GetFlagsResponse extends SuccessfulResponse {
  data: Flag[];
}

interface GetFlagResponse extends SuccessfulResponse {
  data: Flag | null;
}

interface UpsertFlagResponse extends SuccessfulResponse {
  data: Flag;
}

interface DeleteFlagResponse extends SuccessfulResponse {
  data: true;
}

test("v1 flags", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/flags");

  t.is(res.status, 200);

  const result = (await res.json()) as GetFlagsResponse;

  t.is(result.data.length, 9);
  t.is(result.data[0]?.name, "eq");
  t.is(result.data[1]?.name, "gt");
  t.is(result.data[2]?.name, "gte");
  t.is(result.data[3]?.name, "in");
  t.is(result.data[4]?.name, "lt");
  t.is(result.data[5]?.name, "lte");
  t.is(result.data[6]?.name, "neq");
  t.is(result.data[7]?.name, "nin");
  t.is(result.data[8]?.name, "on");
});

test("v1 flags w/ disabled", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/flags?include_disabled=1");

  t.is(res.status, 200);

  const result = (await res.json()) as GetFlagsResponse;

  t.is(result.data.length, 10);
  t.is(result.data[0]?.name, "eq");
  t.is(result.data[1]?.name, "gt");
  t.is(result.data[2]?.name, "gte");
  t.is(result.data[3]?.name, "in");
  t.is(result.data[4]?.name, "lt");
  t.is(result.data[5]?.name, "lte");
  t.is(result.data[6]?.name, "neq");
  t.is(result.data[7]?.name, "nin");
  t.is(result.data[8]?.name, "off");
  t.is(result.data[9]?.name, "on");
});

test("v1 flags get", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/flags/on");

  t.is(res.status, 200);

  const result = (await res.json()) as GetFlagResponse;

  t.is(result.data?.name, "on");
  t.is(result.data?.enabled, true);
});

test("v1 flags upsert", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/flags/test", {
    method: "PUT",
    body: {
      description: "A test flag",
      conditions: [
        {
          field: "test",
          operator: "eq",
          value: "test",
        },
      ],
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as UpsertFlagResponse;

  t.is(result1.data.name, "test");
  t.is(result1.data.description, "A test flag");
  t.is(result1.data.enabled, true);
  t.is(result1.data.conditions?.length, 1);

  const res2 = await makeRequest(service, "/v1/flags/test");

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as GetFlagResponse;

  t.is(result2.data?.name, "test");
  t.is(result2.data?.description, "A test flag");
  t.is(result2.data?.enabled, true);
  t.is(result2.data?.conditions?.length, 1);
});

test("v1 flags upsert w/ update", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/flags/test", {
    method: "PUT",
    body: {
      description: "A test flag",
      conditions: [
        {
          field: "test",
          operator: "eq",
          value: "test",
        },
      ],
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as UpsertFlagResponse;

  t.is(result1.data.name, "test");
  t.is(result1.data.description, "A test flag");
  t.is(result1.data.enabled, true);
  t.is(result1.data.conditions?.length, 1);

  const res2 = await makeRequest(service, "/v1/flags/test");

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as GetFlagResponse;

  t.is(result2.data?.name, "test");
  t.is(result2.data?.description, "A test flag");
  t.is(result2.data?.enabled, true);
  t.is(result2.data?.conditions?.length, 1);

  const res3 = await makeRequest(service, "/v1/flags/test", {
    method: "PUT",
    body: {
      description: "A test flag",
      enabled: false,
      conditions: [
        {
          field: "test",
          operator: "eq",
          value: "test",
        },
      ],
    },
  });

  t.is(res3.status, 200);

  const res4 = await makeRequest(service, "/v1/flags/test");

  t.is(res4.status, 200);

  const result4 = (await res4.json()) as GetFlagResponse;

  t.is(result4.data?.name, "test");
  t.is(result4.data?.description, "A test flag");
  t.is(result4.data?.enabled, false);
  t.is(result4.data?.conditions?.length, 1);
});

test("v1 flags delete", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/flags/test", {
    method: "PUT",
    body: {
      description: "A test flag",
      conditions: [
        {
          field: "test",
          operator: "eq",
          value: "test",
        },
      ],
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as UpsertFlagResponse;

  t.is(result1.data.name, "test");
  t.is(result1.data.description, "A test flag");
  t.is(result1.data.enabled, true);
  t.is(result1.data.conditions?.length, 1);

  const res2 = await makeRequest(service, "/v1/flags/test", {
    method: "DELETE",
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as DeleteFlagResponse;

  t.is(result2.data, true);

  const res3 = await makeRequest(service, "/v1/flags/test");

  t.is(res3.status, 404);

  const result3 = (await res3.json()) as GetFlagResponse;

  t.is(result3.data, null);
});

// Ask
interface AskResponse extends SuccessfulResponse {
  data: string[];
}

test("v1 ask", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {},
  });

  t.is(res.status, 200);

  const result = (await res.json()) as AskResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0], "on");
});

test("v1 ask w/ on flag", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["on"],
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as AskResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0], "on");
});

test("v1 ask w/ off flag", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["off"],
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as AskResponse;

  t.is(result.data.length, 0);
});

test("v1 ask w/ on and off flag", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["on", "off"],
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as AskResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0], "on");
});

test("v1 ask w/ eq flag", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["eq"],
      context: {
        test: "test",
      },
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as AskResponse;

  t.is(result1.data.length, 1);
  t.is(result1.data[0], "eq");

  const res2 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["eq"],
      context: {
        test: "invalid",
      },
    },
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as AskResponse;

  t.is(result2.data.length, 0);
});

test("v1 ask w/ neq flag", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["neq"],
      context: {
        test: "invalid",
      },
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as AskResponse;

  t.is(result1.data.length, 1);
  t.is(result1.data[0], "neq");

  const res2 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["neq"],
      context: {
        test: "test",
      },
    },
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as AskResponse;

  t.is(result2.data.length, 0);
});

test("v1 ask w/ gt flag", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["gt"],
      context: {
        test: 2,
      },
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as AskResponse;

  t.is(result1.data.length, 1);
  t.is(result1.data[0], "gt");

  const res2 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["gt"],
      context: {
        test: 1,
      },
    },
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as AskResponse;

  t.is(result2.data.length, 0);
});

test("v1 ask w/ gte flag", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["gte"],
      context: {
        test: 1,
      },
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as AskResponse;

  t.is(result1.data.length, 1);
  t.is(result1.data[0], "gte");

  const res2 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["gte"],
      context: {
        test: 0,
      },
    },
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as AskResponse;

  t.is(result2.data.length, 0);
});

test("v1 ask w/ lt flag", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["lt"],
      context: {
        test: 0,
      },
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as AskResponse;

  t.is(result1.data.length, 1);
  t.is(result1.data[0], "lt");

  const res2 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["lt"],
      context: {
        test: 1,
      },
    },
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as AskResponse;

  t.is(result2.data.length, 0);
});

test("v1 ask w/ lte flag", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["lte"],
      context: {
        test: 1,
      },
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as AskResponse;

  t.is(result1.data.length, 1);
  t.is(result1.data[0], "lte");

  const res2 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["lte"],
      context: {
        test: 2,
      },
    },
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as AskResponse;

  t.is(result2.data.length, 0);
});

test("v1 ask w/ in flag", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["in"],
      context: {
        test: "test",
      },
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as AskResponse;

  t.is(result1.data.length, 1);
  t.is(result1.data[0], "in");

  const res2 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["in"],
      context: {
        test: "invalid",
      },
    },
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as AskResponse;

  t.is(result2.data.length, 0);
});

test("v1 ask w/ nin flag", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["nin"],
      context: {
        test: "invalid",
      },
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as AskResponse;

  t.is(result1.data.length, 1);
  t.is(result1.data[0], "nin");

  const res2 = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["nin"],
      context: {
        test: "test",
      },
    },
  });

  t.is(res2.status, 200);

  const result2 = (await res2.json()) as AskResponse;

  t.is(result2.data.length, 0);
});

test("v1 ask w/ all flags", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/ask", {
    method: "POST",
    body: {
      flags: ["on", "off", "eq", "neq", "gt", "gte", "lt", "lte", "in", "nin"],
      context: {
        test: "test",
      },
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as AskResponse;

  t.is(result.data.length, 3);
  t.is(result.data[0], "eq");
  t.is(result.data[1], "in");
  t.is(result.data[2], "on");
});

// Admin
interface AdminInfoResponse extends SuccessfulResponse {
  data: {
    endpoints: {
      v1: {
        ask: string;
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
        ask: "/custom-ask",
      },
    },
  });
  const res = await makeRequest(service, "/v1/admin/info");

  t.is(res.status, 200);

  const result = (await res.json()) as AdminInfoResponse;

  t.is(result.data.endpoints.v1.ask, "/custom-ask");
});

test("v1 admin migrate", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/admin/migrate", {
    method: "POST",
  });

  t.is(res.status, 200);

  const result = (await res.json()) as AdminMigrateResponse;

  t.true(result.data);
});

test("v1 admin w/ custom endpoint", async (t) => {
  const service = createTestService({
    endpoints: {
      v1: {
        admin: "/custom-admin",
        ask: "/custom-ask",
      },
    },
  });
  const res = await makeRequest(service, "/custom-admin/info");

  t.is(res.status, 200);

  const result = (await res.json()) as AdminInfoResponse;

  t.is(result.data.endpoints.v1.ask, "/custom-ask");
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
      v1: {
        public: "/custom-public",
      },
    },
  });
  const res = await makeRequest(service, "/custom-public/open-api.json");

  t.is(res.status, 200);

  const result = (await res.json()) as PublicResponse;

  t.is(result.openapi, "3.0.0");
});
