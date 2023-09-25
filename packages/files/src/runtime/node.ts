import { S3FilesAdapter } from "../files/s3.js";
import { SqliteStorageAdapter } from "../storage/sqlite.js";
import { type Runtime, type ServerOptions } from "../types.js";

export function runtime(
  config: ServerOptions,
  env: Record<string, unknown>,
): Runtime {
  const s3UrlString = env[config.env.files] as string;
  const s3Url = new URL(s3UrlString);
  const [region, bucket] = s3Url.pathname.split("/").slice(1);
  const db = env[config.env.db] as string;

  return {
    files: new S3FilesAdapter({
      credentials: {
        accessKeyId: s3Url.username,
        secretAccessKey: s3Url.password,
      },
      region: region as string,
      endpoint: `${s3Url.protocol}//${s3Url.host}`,
      bucket: bucket as string,
    }),
    storage: new SqliteStorageAdapter(
      db.endsWith(".sqlite") ? { db } : undefined,
    ),
  };
}
