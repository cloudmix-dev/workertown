import { UpstashRedisCacheAdapter } from "../cache/upstash-redis.js";
import { PlanetscaleStorageAdapter } from "../storage/planetscale.js";
import {
  type GetRuntimeOptions,
  type Runtime,
  type ServerOptions,
} from "../types.js";

function generateUrl(url: URL) {
  return `${url.protocol}//${url.host}/${url.pathname}${url.search}`;
}

export function runtime(
  config: ServerOptions,
  env: Record<string, unknown>,
  options: GetRuntimeOptions = { cache: true },
): Runtime {
  const planetScaleUrlString = env[config.env.db] as string;
  const upstashRedisUrlString = env[config.env.cache] as string;
  const planetScaleUrl = new URL(planetScaleUrlString);
  let upstashRedisUrl: URL | undefined = undefined;

  if (!upstashRedisUrl) {
    upstashRedisUrl = new URL(upstashRedisUrlString);
  }

  return {
    cache: options.cache
      ? new UpstashRedisCacheAdapter({
          url: generateUrl(upstashRedisUrl),
          token: upstashRedisUrl.username,
        })
      : false,
    storage: new PlanetscaleStorageAdapter({
      url: generateUrl(planetScaleUrl),
      username: planetScaleUrl.username,
      password: planetScaleUrl.password,
    }),
  };
}
