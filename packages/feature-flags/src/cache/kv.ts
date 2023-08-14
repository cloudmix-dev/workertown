import { KVCacheAdapter as BaseKVCacheAdapter } from "@workertown/internal-cache/kv";

import { type Flag } from "../storage/storage-adapter.js";

export class KVCacheAdapter extends BaseKVCacheAdapter<Flag[]> {
  public readonly prefix: string = "wt_flags";
}
