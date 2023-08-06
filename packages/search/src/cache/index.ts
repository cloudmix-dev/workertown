import { CacheAdapter as BaseCacheAdapter } from "@workertown/internal-cache";

import { type SearchDocument } from "../storage/storage-adapter.js";

export class CacheAdapter extends BaseCacheAdapter<SearchDocument[]> {}
