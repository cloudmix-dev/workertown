import { MemoryCacheAdapter as BaseMemoryCacheAdapter } from "@workertown/internal-cache/memory";

import { type SearchDocument } from "../storage/storage-adapter.js";

export class MemoryCacheAdapter extends BaseMemoryCacheAdapter<
  SearchDocument[]
> {
  public readonly prefix: string = "wt_search";
}
