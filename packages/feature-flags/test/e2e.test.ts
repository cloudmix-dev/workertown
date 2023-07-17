import test from "ava";

import { createTestService, makeRequest } from "./_utils";

interface SuccessfulResponse {
  status: 200;
  success: true;
}

// Ask
interface AskResponse extends SuccessfulResponse {
  data: string[];
}

test("ask", async (t) => {
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

test("ask w/ on flag", async (t) => {
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

test("ask w/ off flag", async (t) => {
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

test("ask w/ on and off flag", async (t) => {
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

test("ask w/ eq flag", async (t) => {
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

test("ask w/ neq flag", async (t) => {
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

test("ask w/ gt flag", async (t) => {
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

test("ask w/ gte flag", async (t) => {
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

test("ask w/ lt flag", async (t) => {
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

test("ask w/ lte flag", async (t) => {
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

test("ask w/ in flag", async (t) => {
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

test("ask w/ nin flag", async (t) => {
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

test("ask w/ all flags", async (t) => {
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

test("admin info", async (t) => {
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

test("admin migrate", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/admin/migrate", {
    method: "POST",
  });

  t.is(res.status, 200);

  const result = (await res.json()) as AdminMigrateResponse;

  t.true(result.data);
});

test("admin w/ custom endpoint", async (t) => {
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

test("public open-api.json", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/open-api.json");

  t.is(res.status, 200);

  const result = (await res.json()) as PublicResponse;

  t.is(result.openapi, "3.0.0");
});

test("public w/ custom endpoint", async (t) => {
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
