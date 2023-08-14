import { UpstashRedisCacheAdapter as BaseUpstashRedisCacheAdapter } from "@workertown/internal-cache/upstash-redis";

import { type SearchDocument } from "../storage/storage-adapter.js";

export class UpstashRedisCacheAdapter extends BaseUpstashRedisCacheAdapter<
  SearchDocument[]
> {
  public readonly prefix: string = "wt_search";
}
