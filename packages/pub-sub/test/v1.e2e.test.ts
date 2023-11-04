import test from "ava";
import sinon from "sinon";

import { createTestService, makeRequest } from "./_utils";

interface SuccessfulResponse {
  status: 200;
  success: true;
}

const fetchStub = sinon.stub();

test.before(async () => {
  globalThis.fetch = fetchStub;
});

test.beforeEach(() => {
  fetchStub.reset();
});

// Subscriptions
interface SubscriptionsResponse extends SuccessfulResponse {
  data: {
    id: string;
  }[];
}

test.serial("v1 subscriptions", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/subscriptions");

  t.is(res.status, 200);

  const result = (await res.json()) as SubscriptionsResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].id, "e29e3cf3-36aa-435a-a3dd-545d788f2830");
});

test.serial("v1 subscriptions w/ topic", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/subscriptions?topic=TEST");

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as SubscriptionsResponse;

  t.is(result1.data.length, 1);
  t.is(result1.data[0].id, "e29e3cf3-36aa-435a-a3dd-545d788f2830");

  const res2 = await makeRequest(service, "/v1/subscriptions?topic=OTHER");

  t.is(res1.status, 200);

  const result2 = (await res2.json()) as SubscriptionsResponse;

  t.is(result2.data.length, 0);
});

// Create subscription
interface CreateSubscriptionResponse extends SuccessfulResponse {
  data: {
    id: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    headers?: Record<string, string>;
    queryParameters?: Record<string, string>;
  };
}

test.serial("v1 create subscription", async (t) => {
  const service = createTestService();
  const res1 = await makeRequest(service, "/v1/subscriptions", {
    method: "POST",
    body: {
      topic: "OTHER",
      endpoint: "http://localhost:3000",
    },
  });

  t.is(res1.status, 200);

  const result1 = (await res1.json()) as CreateSubscriptionResponse;

  // Check if the ID is a random short ID (see MemoryStorageAdapter)
  t.assert(/^[a-z,0-9]{7,7}$/.test(result1.data.id));

  const res2 = await makeRequest(service, "/v1/subscriptions?topic=OTHER");

  t.is(res1.status, 200);

  const result2 = (await res2.json()) as SubscriptionsResponse;

  t.is(result2.data.length, 1);
  t.is(result2.data[0].id, result1.data.id);
});

test.serial("v1 create subscription w/ method", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/subscriptions", {
    method: "POST",
    body: {
      topic: "OTHER",
      endpoint: "http://localhost:3000",
      method: "GET",
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as CreateSubscriptionResponse;

  t.is(result.data.method, "GET");
});

test.serial("v1 create subscription w/ headers", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/subscriptions", {
    method: "POST",
    body: {
      topic: "OTHER",
      endpoint: "http://localhost:3000",
      headers: {
        "X-Test": "test",
      },
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as CreateSubscriptionResponse;

  t.deepEqual(result.data.headers, {
    "X-Test": "test",
  });
});

test.serial("v1 create subscription w/ query params", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/subscriptions", {
    method: "POST",
    body: {
      topic: "OTHER",
      endpoint: "http://localhost:3000",
      queryParameters: {
        test: "test",
      },
    },
  });

  t.is(res.status, 200);

  const result = (await res.json()) as CreateSubscriptionResponse;

  t.deepEqual(result.data.queryParameters, {
    test: "test",
  });
});
