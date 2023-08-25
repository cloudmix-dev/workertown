import { type ExecutionContext } from "ava";
import crypto from "node:crypto";

import { FilesAdapter } from "../../src/files";

globalThis.crypto = crypto.webcrypto as Crypto;

export async function testFilesAdapterE2E(
  t: ExecutionContext,
  files: FilesAdapter,
) {
  // Create bucket
  await files.setup();

  const filePath = "/test/1.txt";
  const filContent = "This is some test file content.";
  const fileMetadata = {
    test: "test",
  };
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // Put a file
  await files.put("/test/1.txt", encoder.encode(filContent), fileMetadata);

  // Get a file
  const getResult = await files.get(filePath);
  let getResultContents = "";

  if (getResult instanceof ReadableStream) {
    const reader = getResult.getReader();
    const chunks: number[][] = [];
    let length = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      length += value.length;

      chunks.push(value as number[]);
    }

    const buffer = new Uint8Array(length);
    let position = 0;

    for (const chunk of chunks) {
      buffer.set(chunk, position);
      position += chunk.length;
    }

    getResultContents = decoder.decode(buffer);
  }

  t.is(getResultContents, filContent);

  // Get a file's metadata
  const getMetadataResult = await files.getMetadata(filePath);

  t.deepEqual(getMetadataResult, fileMetadata);

  // Delete search document
  await files.delete(filePath);

  const dontGetResult = await files.get(filePath);

  t.is(dontGetResult, null);

  // Delete bucket
  await files.setup(true);
}
