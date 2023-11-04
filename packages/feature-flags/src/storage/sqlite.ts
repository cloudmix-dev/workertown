import {
  SqliteDialect,
  type SqliteDialectOptions,
} from "@workertown/internal-storage/dialects/sqlite";

import { BaseSqliteStorageAdapter } from "./base/sqlite.js";

export interface SqliteStorageAdapterOptions extends SqliteDialectOptions {
  migrationsPrefix?: string;
}

export class SqliteStorageAdapter extends BaseSqliteStorageAdapter {
  constructor(options: SqliteStorageAdapterOptions = {}) {
    super({
      dialect: new SqliteDialect(options),
      migrationsPrefix: options.migrationsPrefix,
    });
  }
}
