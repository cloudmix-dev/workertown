import { UpstashRedisCacheAdapter as BaseUpstashRedisCacheAdapter } from "@workertown/internal-cache/upstash-redis";

import { type Flag } from "../storage/storage-adapter.js";

export class UpstashRedisCacheAdapter extends BaseUpstashRedisCacheAdapter<
  Flag[]
> {
  public readonly prefix: string = "wt_flags";
}
