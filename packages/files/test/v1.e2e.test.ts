import test from "ava";

import { createTestService, makeRequest, readFile } from "./_utils";

interface SuccessfulResponse {
  status: 200;
  success: true;
}

// Files
test("v1 get file", async (t) => {
  const service = createTestService();
  const filContent = "This is some test file content.";
  const formData = new FormData();

  formData.append("file", new Blob([filContent]));

  await makeRequest(service, "/v1/files/test/1.txt", {
    method: "PUT",
    body: formData,
  });

  const res = await makeRequest(service, "/v1/files/test/1.txt");

  t.is(res.status, 200);

  const result = await readFile(res.body as ReadableStream);

  t.is(result, filContent);
});

interface FileMetadataResponse extends SuccessfulResponse {
  data: {
    metadata: {
      test: string;
    };
  };
}

test("v1 get file w/ metadata", async (t) => {
  const service = createTestService();
  const filContent = "This is some test file content.";
  const formData = new FormData();

  formData.append("file", new Blob([filContent]));
  formData.append(
    "metadata",
    JSON.stringify({
      test: "test",
    }),
  );

  await makeRequest(service, "/v1/files/test/1.txt", {
    method: "PUT",
    body: formData,
  });

  const res = await makeRequest(service, "/v1/files/test/1.txt?metadata=true");

  t.is(res.status, 200);

  const result = (await res.json()) as FileMetadataResponse;

  t.deepEqual(result.data.metadata, { test: "test" });
});

interface PutFileResponse extends SuccessfulResponse {
  data: {
    path: string;
  };
}

test("v1 put file", async (t) => {
  const service = createTestService();
  const filContent = "This is some test file content.";
  const formData = new FormData();

  formData.append("file", new Blob([filContent]));

  const res1 = await makeRequest(service, "/v1/files/test/1.txt", {
    method: "PUT",
    body: formData,
  });
  const result1 = (await res1.json()) as PutFileResponse;

  t.is(res1.status, 200);
  t.deepEqual(result1.data, { path: "test/1.txt" });

  const res2 = await makeRequest(service, "/v1/files/test/1.txt");

  t.is(res2.status, 200);

  const result = await readFile(res2.body as ReadableStream);

  t.is(result, filContent);
});

interface DeleteFileResponse extends SuccessfulResponse {
  data: {
    path: string;
  };
}

test("v1 delete file", async (t) => {
  const service = createTestService();
  const filContent = "This is some test file content.";
  const formData = new FormData();

  formData.append("file", new Blob([filContent]));

  await makeRequest(service, "/v1/files/test/1.txt", {
    method: "PUT",
    body: formData,
  });

  const res1 = await makeRequest(service, "/v1/files/test/1.txt");

  t.is(res1.status, 200);

  const result = await readFile(res1.body as ReadableStream);

  t.is(result, filContent);

  const res2 = await makeRequest(service, "/v1/files/test/1.txt", {
    method: "DELETE",
  });
  const result2 = (await res2.json()) as DeleteFileResponse;

  t.is(res2.status, 200);
  t.deepEqual(result2.data, { path: "test/1.txt" });
});

interface CretaeUploadUrlResponse extends SuccessfulResponse {
  data: {
    id: string;
  };
}

test("v1 files w/ custom endpoint", async (t) => {
  const service = createTestService({
    endpoints: {
      v1: {
        files: "/custom-files",
      },
    },
  });
  const filContent = "This is some test file content.";
  const formData = new FormData();

  formData.append("file", new Blob([filContent]));

  await makeRequest(service, "/custom-files/test/1.txt", {
    method: "PUT",
    body: formData,
  });

  const res = await makeRequest(service, "/custom-files/test/1.txt");

  t.is(res.status, 200);

  const result = await readFile(res.body as ReadableStream);

  t.is(result, filContent);
});

// Upload URLS
test("v1 create upload", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/uploads", {
    method: "POST",
    body: {
      path: "/test/1.txt",
      callbackUrl: "http://localhost:3000",
      metadata: {
        test: "test",
      },
    },
  });
  const result = (await res.json()) as CretaeUploadUrlResponse;

  t.is(res.status, 200);
  t.assert(typeof result.data.id === "string");
});

test("v1 public upload", async (t) => {
  const service = createTestService();
  const res = await makeRequest(service, "/v1/uploads", {
    method: "POST",
    body: {
      path: "/test/1.txt",
      metadata: {
        test: "test",
      },
    },
  });
  const result = (await res.json()) as CretaeUploadUrlResponse;
  const filContent = "This is some test file content.";
  const formData = new FormData();

  formData.append("file", new Blob([filContent]));

  const res2 = await makeRequest(service, `/upload/${result.data.id}`, {
    method: "POST",
    body: formData,
  });
  const result2 = (await res2.json()) as PutFileResponse;

  t.is(res2.status, 200);
  t.deepEqual(result2.data, { path: "test/1.txt" });

  const res3 = await makeRequest(service, "/v1/files/test/1.txt");

  t.is(res3.status, 200);

  const result3 = await readFile(res3.body as ReadableStream);

  t.is(result3, filContent);
});

test("v1 uploads w/ custom endpoint", async (t) => {
  const service = createTestService({
    endpoints: {
      v1: {
        uploads: "/custom-uploads",
      },
    },
  });
  const res = await makeRequest(service, "/custom-uploads", {
    method: "POST",
    body: {
      path: "/test/1.txt",
      callbackUrl: "http://localhost:3000",
      metadata: {
        test: "test",
      },
    },
  });
  const result = (await res.json()) as CretaeUploadUrlResponse;

  t.is(res.status, 200);
  t.assert(typeof result.data.id === "string");
});

// Admin
interface AdminInfoResponse extends SuccessfulResponse {
  data: {
    endpoints: {
      v1: {
        files: string;
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
        files: "/custom-files",
      },
    },
  });
  const res = await makeRequest(service, "/v1/admin/info");

  t.is(res.status, 200);

  const result = (await res.json()) as AdminInfoResponse;

  t.is(result.data.endpoints.v1.files, "/custom-files");
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
        files: "/custom-files",
      },
    },
  });
  const res = await makeRequest(service, "/custom-admin/info");

  t.is(res.status, 200);

  const result = (await res.json()) as AdminInfoResponse;

  t.is(result.data.endpoints.v1.files, "/custom-files");
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
