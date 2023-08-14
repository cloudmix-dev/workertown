import { MemoryCacheAdapter as BaseMemoryCacheAdapter } from "@workertown/internal-cache/memory";

import { type Flag } from "../storage/storage-adapter.js";

export class MemoryCacheAdapter extends BaseMemoryCacheAdapter<Flag[]> {
  public readonly prefix: string = "wt_flags";
}
