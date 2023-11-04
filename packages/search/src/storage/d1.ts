import {
  D1Dialect,
  type D1DialectOptions,
} from "@workertown/internal-storage/dialects/d1";

import { BaseSqliteStorageAdapter } from "./base/sqlite.js";

export interface D1StorageAdapterOptions extends D1DialectOptions {
  migrationsPrefix?: string;
}

export class D1StorageAdapter extends BaseSqliteStorageAdapter {
  constructor(options: D1StorageAdapterOptions) {
    super({
      dialect: new D1Dialect(options),
      migrationsPrefix: options.migrationsPrefix,
    });
  }
}
