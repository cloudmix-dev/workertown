import { NoOpCacheAdapter as BaseNoOpCacheAdapter } from "@workertown/internal-cache/no-op";

import { type Flag } from "../storage/storage-adapter.js";

export class NoOpCacheAdapter extends BaseNoOpCacheAdapter<Flag[]> {}
