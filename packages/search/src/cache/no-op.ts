import { NoOpCacheAdapter as BaseNoOpCacheAdapter } from "@workertown/internal-cache/no-op";

import { type SearchDocument } from "../storage/storage-adapter.js";

export class NoOpCacheAdapter extends BaseNoOpCacheAdapter<SearchDocument[]> {}
