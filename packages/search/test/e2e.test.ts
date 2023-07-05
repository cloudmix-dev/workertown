import anyTest, { TestFn } from "ava";
import { UnstableDevWorker, unstable_dev } from "wrangler";

interface SearchResponse {
  data: {
    id: string;
    item: Record<string, unknown>;
    score: number;
    terms: string[];
  }[];
  status: number;
  success: boolean;
}

const test = anyTest as TestFn<{ worker: UnstableDevWorker }>;

test.before(async (t) => {
  const worker = await unstable_dev("./test/fixtures/worker.ts", {
    vars: {
      SEARCH_API_KEY: "test",
    },
    experimental: {
      d1Databases: [
        {
          binding: "SEARCH_DB",
          database_id: "test",
          database_name: "search",
        },
      ],
      disableExperimentalWarning: true,
    },
  });

  // Run migrations
  const migrateRes = await worker.fetch(
    "http://search.local/v1/admin/migrate",
    {
      method: "POST",
      headers: {
        authorization: "Bearer test",
      },
    }
  );

  t.is(migrateRes.status, 200);

  const [indexRes1, indexRes2, indexRes3] = await Promise.all([
    worker.fetch("http://search.local/v1/items/1", {
      method: "PUT",
      headers: {
        authorization: "Bearer test",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        tenant: "test",
        index: "test",
        data: {
          title: "Test item 1",
          content: "This is some test content",
        },
      }),
    }),
    worker.fetch("http://search.local/v1/items/2", {
      method: "PUT",
      headers: {
        authorization: "Bearer test",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        tenant: "test",
        index: "test",
        data: {
          title: "Test item 2",
          content: "This is some more test content",
        },
      }),
    }),
    worker.fetch("http://search.local/v1/items/3", {
      method: "PUT",
      headers: {
        authorization: "Bearer test",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        tenant: "test",
        index: "test",
        data: {
          title: "Test item 3",
          content: "This doesn't contain that t word",
        },
      }),
    }),
  ]);

  t.is(indexRes1.status, 200);
  t.is(indexRes2.status, 200);
  t.is(indexRes3.status, 200);

  t.context.worker = worker;
});

test.serial("performs search correctly", async (t) => {
  const { worker } = t.context;

  // Check the item appears in a valid search
  const [searchTenantRes, searchIndexRes] = await Promise.all([
    worker.fetch(
      "http://search.local/v1/search/test?term=test&fields=content",
      {
        headers: {
          authorization: "Bearer test",
        },
      }
    ),
    worker.fetch(
      "http://search.local/v1/search/test/test?term=test&fields=content",
      {
        headers: {
          authorization: "Bearer test",
        },
      }
    ),
  ]);

  t.is(searchTenantRes.status, 200);
  t.is(searchIndexRes.status, 200);

  const searchTenantResult = (await searchTenantRes.json()) as SearchResponse;
  const searchIndexResult = (await searchIndexRes.json()) as SearchResponse;

  t.is(searchTenantResult?.data?.length, 2);
  t.is(searchIndexResult?.data?.length, 2);

  t.true(
    searchTenantResult?.data?.[0].score > searchTenantResult?.data?.[1].score
  );

  // Check the item does not appear in an invalid search
  const incorrectSearchRes = await worker.fetch(
    "http://search.local/v1/search/test/test?term=invalid&fields=content",
    {
      headers: {
        authorization: "Bearer test",
      },
    }
  );

  t.is(incorrectSearchRes.status, 200);

  const incorrectSearchResult =
    (await incorrectSearchRes.json()) as SearchResponse;

  t.is(incorrectSearchResult?.data?.length, 0);

  // Check the item doesn't appear in a valid search against a different index
  const incorrectTenantSearchRes = await worker.fetch(
    "http://search.local/v1/search/test/invalid?term=invalid&fields=content",
    {
      headers: {
        authorization: "Bearer test",
      },
    }
  );

  t.is(incorrectTenantSearchRes.status, 200);

  const incorrectTenantSearchResult =
    (await incorrectTenantSearchRes.json()) as SearchResponse;

  t.is(incorrectTenantSearchResult?.data?.length, 0);

  // Check the item doesn't appear in a valid search against a different field
});

// test.serial("indexes items correctly 2", async (t) => {
//   const { worker } = t.context;
// });
