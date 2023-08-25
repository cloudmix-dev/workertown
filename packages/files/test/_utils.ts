import files, { type CreateServerOptions } from "../src";
import { runtime } from "../src/runtime/test";
import { type UploadUrl } from "../src/storage";

const UPLOAD_URLS: UploadUrl[] = [
  {
    id: "eb97a6a1-9432-4e46-a31f-42e0314a6269",
    path: "/test/1.txt",
    callbackUrl: "http://localhost:3000",
    metadata: {
      test: "test",
    },
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  },
];

export function createTestService(
  options: CreateServerOptions = {},
  initialUploadUrls: UploadUrl[] = UPLOAD_URLS,
) {
  return files({
    ...options,
    auth: { apiKey: { apiKey: "test" } },
    logger: false,
    runtime: (config, env) =>
      runtime(config, env, {
        initialUploadUrls,
      }),
    files: {
      uploadSigningKey: "test",
    },
  });
}

export function makeRequest(
  service: ReturnType<typeof files>,
  path: string,
  {
    method = "GET",
    body,
  }: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
  } = {},
) {
  const headers: Record<string, string> = {
    authorization: "Bearer test",
  };
  let bodyData: string | FormData | undefined;

  if (body instanceof FormData) {
    bodyData = body;
  } else if (body) {
    bodyData = JSON.stringify(body);
    headers["content-type"] = "application/json";
  }

  return service.fetch(
    new Request(`http://files.local${path}`, {
      method,
      headers,
      body: bodyData,
    }),
  );
}

export async function readFile(stream: ReadableStream) {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  const chunks: number[][] = [];
  let length = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (value) {
      length += value?.length;

      chunks.push(value as number[]);
    }
  }

  const buffer = new Uint8Array(length);
  let position = 0;

  for (const chunk of chunks) {
    buffer.set(chunk, position);
    position += chunk.length;
  }

  return decoder.decode(buffer);
}
