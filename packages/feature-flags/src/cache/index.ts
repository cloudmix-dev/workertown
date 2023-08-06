import { CacheAdapter as BaseCacheAdapter } from "@workertown/internal-cache";

import { type Flag } from "../storage/storage-adapter.js";

export class CacheAdapter extends BaseCacheAdapter<Flag[]> {}
