import {
  PostgresDialect,
  type PostgresDialectOptions,
} from "@workertown/internal-storage/dialects/postgres";

import { BasePostgresStorageAdapter } from "./base-postgres.js";

export interface PostgresStorageAdapterOptions extends PostgresDialectOptions {
  migrationsPrefix?: string;
}

export class PostgresStorageAdapter extends BasePostgresStorageAdapter {
  constructor(options: PostgresStorageAdapterOptions) {
    super({
      dialect: new PostgresDialect(options),
      migrationsPrefix: options.migrationsPrefix,
    });
  }
}
