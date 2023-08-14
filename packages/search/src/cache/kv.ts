import { KVCacheAdapter as BaseKVCacheAdapter } from "@workertown/internal-cache/kv";

import { type SearchDocument } from "../storage/storage-adapter.js";

export class KVCacheAdapter extends BaseKVCacheAdapter<SearchDocument[]> {
  public readonly prefix: string = "wt_search";
}
