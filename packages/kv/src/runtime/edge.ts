import { UpstashRedisStorageAdapter } from "../storage/upstash-redis.js";
import { type CreateServerOptions, type Runtime } from "../types.js";

function generateUrl(url: URL) {
  return `${url.protocol}//${url.host}/${url.pathname}${url.search}`;
}

export function runtime(
  config: CreateServerOptions,
  env: Record<string, unknown>,
): Runtime {
  const upstashRedisUrlString = env[config.env.db] as string;
  const upstashRedisUrl = new URL(upstashRedisUrlString);

  return {
    storage: new UpstashRedisStorageAdapter({
      url: generateUrl(upstashRedisUrl),
      token: upstashRedisUrl.username,
    }),
  };
}
