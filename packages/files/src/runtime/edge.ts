import { S3FilesAdapter } from "../files/s3.js";
import { PlanetscaleStorageAdapter } from "../storage/planetscale.js";
import { type Runtime, type ServerOptions } from "../types.js";

function generateUrl(url: URL) {
  return `${url.protocol}//${url.host}/${url.pathname}${url.search}`;
}

export function runtime(
  config: ServerOptions,
  env: Record<string, unknown>,
): Runtime {
  const s3UrlString = env[config.env.files] as string;
  const s3Url = new URL(s3UrlString);
  const [region, bucket] = s3Url.pathname.split("/").slice(1);
  const planetScaleUrlString = env[config.env.db] as string;
  const planetScaleUrl = new URL(planetScaleUrlString);

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
    storage: new PlanetscaleStorageAdapter({
      url: generateUrl(planetScaleUrl),
      username: planetScaleUrl.username,
      password: planetScaleUrl.password,
    }),
  };
}
