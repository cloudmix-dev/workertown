import test from "ava";

import { createTestService, makeRequest } from "./_utils";

interface SuccessfulResponse {
  status: 200;
  success: true;
}

// Search
interface SearchResponse extends SuccessfulResponse {
  data: {
    id: string;
    document: Record<string, unknown>;
    score: number;
    terms: string[];
  }[];
  pagination: {
    hasMore: boolean;
    cursor: string | null;
  };
}

test("v1 search w/ tenant, single field", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/search/test?term=test&fields=content"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SearchResponse;

  t.is(result.data.length, 2);
  t.is(result.data[0].id, "document_1");
  t.is(result.data[1].id, "document_2");
});

test("v1 search w/ tenant, multiple fields", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/search/test?term=test&fields=content,title"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SearchResponse;

  t.is(result.data.length, 4);
  t.is(result.data[0].id, "document_1");
  t.is(result.data[1].id, "document_2");
  t.is(result.data[2].id, "document_4");
  t.is(result.data[3].id, "document_3");
});

test("v1 search w/ tenant, index, single field", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/search/test/test?term=test&fields=content"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SearchResponse;

  t.is(result.data.length, 2);
  t.is(result.data[0].id, "document_1");
  t.is(result.data[1].id, "document_2");
});

test("v1 search w/ tenant, index, multiple fields", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/search/test/test?term=test&fields=content,title"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SearchResponse;

  t.is(result.data.length, 3);
  t.is(result.data[0].id, "document_1");
  t.is(result.data[1].id, "document_2");
  t.is(result.data[2].id, "document_3");
});

test("v1 search w/ tenant, index, single field, limit", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/search/test/test?term=test&fields=content&limit=1"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SearchResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].id, "document_1");
});

test("v1 search w/ tenant, index, single field, cursor", async (t) => {
  const service = createTestService();
  const cursor = btoa("document_1");
  const res = await makeRequest(
    service,
    `/v1/search/test/test?term=test&fields=content&limit=1&after=${cursor}`
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SearchResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].id, "document_2");
});

test("v1 search w/ tenant, index, single field, tags", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/search/test/test?term=test&fields=content&tags=test"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SearchResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].id, "document_1");
});

test("v1 search w/ tenant, index, single field, fuzzy", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/search/test/test?term=tist&fields=content&fuzzy=1"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SearchResponse;

  t.is(result.data.length, 2);
  t.is(result.data[0].id, "document_1");
  t.is(result.data[1].id, "document_2");
});

test("v1 search w/ custom endpoint", async (t) => {
  const service = createTestService({
    endpoints: {
      v1: {
        search: "/custom-search",
      },
    },
  });
  const res = await makeRequest(
    service,
    "/custom-search/test/test?term=test&fields=content"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SearchResponse;

  t.is(result.data.length, 2);
  t.is(result.data[0].id, "document_1");
  t.is(result.data[1].id, "document_2");
});

// Suggest
interface SuggestResponse extends SuccessfulResponse {
  data: {
    suggestion: string;
    terms: string[];
    score: number;
  }[];
}

test("v1 suggest w/ tenant, single field", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/suggest/test?term=test&fields=content"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SuggestResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].suggestion, "test");
  t.is(result.data[0].terms.length, 1);
  t.is(result.data[0].terms[0], "test");
});

test("v1 suggest w/ tenant, multiple fields", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/suggest/test?term=test&fields=content,title"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SuggestResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].suggestion, "test");
  t.is(result.data[0].terms.length, 1);
  t.is(result.data[0].terms[0], "test");
});

test("v1 suggest w/ tenant, index, single field", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/suggest/test/test?term=test&fields=content"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SuggestResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].suggestion, "test");
  t.is(result.data[0].terms.length, 1);
  t.is(result.data[0].terms[0], "test");
});

test("v1 suggest w/ tenant, index, multiple fields", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/suggest/test/test?term=test&fields=content,title"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SuggestResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].suggestion, "test");
  t.is(result.data[0].terms.length, 1);
  t.is(result.data[0].terms[0], "test");
});

test("v1 suggest w/ tenant, index, single field, limit", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/suggest/test/test?term=test&fields=content&limit=1"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SuggestResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].suggestion, "test");
  t.is(result.data[0].terms.length, 1);
  t.is(result.data[0].terms[0], "test");
});

test("v1 suggest w/ tenant, index, single field, tags", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/suggest/test/test?term=test&fields=content&tags=test"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SuggestResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].suggestion, "test");
  t.is(result.data[0].terms.length, 1);
  t.is(result.data[0].terms[0], "test");
});

test("v1 suggest w/ tenant, index, single field, fuzzy", async (t) => {
  const service = createTestService();
  const res = await makeRequest(
    service,
    "/v1/suggest/test/test?term=tist&fields=content&fuzzy=1"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SuggestResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].suggestion, "test");
  t.is(result.data[0].terms.length, 1);
  t.is(result.data[0].terms[0], "test");
});

test("v1 suggest w/ custom endpoint", async (t) => {
  const service = createTestService({
    endpoints: {
      v1: {
        suggest: "/custom-suggest",
      },
    },
  });
  const res = await makeRequest(
    service,
    "/custom-suggest/test/test?term=test&fields=content"
  );

  t.is(res.status, 200);

  const result = (await res.json()) as SuggestResponse;

  t.is(result.data.length, 1);
  t.is(result.data[0].suggestion, "test");
  t.is(result.data[0].terms.length, 1);
  t.is(result.data[0].terms[0], "test");
});

// Documents
// Documents (custom endpoint)

// Tags
interface TagsResponse extends SuccessfulResponse {
  data: string[];
}

test("v1 tags", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/tags");

  t.is(res.status, 200);

  const result = (await res.json()) as TagsResponse;

  t.is(result.data.length, 2);
  t.is(result.data[0], "test");
  t.is(result.data[1], "other");
});

test("v1 tags w/ custom endpoint", async (t) => {
  const service = createTestService({
    endpoints: {
      v1: {
        tags: "/custom-tags",
      },
    },
  });
  const res = await makeRequest(service, "/custom-tags");

  t.is(res.status, 200);

  const result = (await res.json()) as TagsResponse;

  t.is(result.data.length, 2);
  t.is(result.data[0], "test");
  t.is(result.data[1], "other");
});

// Admin
interface AdminInfoResponse extends SuccessfulResponse {
  data: {
    endpoints: {
      v1: {
        search: string;
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
        search: "/custom-search",
      },
    },
  });
  const res = await makeRequest(service, "/v1/admin/info");

  t.is(res.status, 200);

  const result = (await res.json()) as AdminInfoResponse;

  t.is(result.data.endpoints.v1.search, "/custom-search");
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
        search: "/custom-search",
      },
    },
  });
  const res = await makeRequest(service, "/custom-admin/info");

  t.is(res.status, 200);

  const result = (await res.json()) as AdminInfoResponse;

  t.is(result.data.endpoints.v1.search, "/custom-search");
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
