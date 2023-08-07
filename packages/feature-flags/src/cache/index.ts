import { CacheAdapter as BaseCacheAdapter } from "@workertown/internal-cache";

import { type Flag, type FlagCondition } from "../storage/storage-adapter.js";

export class CacheAdapter extends BaseCacheAdapter<Flag[]> {}

export { type Flag, type FlagCondition };
