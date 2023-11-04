import {
  TursoDialect,
  type TursoDialectOptions,
} from "@workertown/internal-storage/dialects/turso";

import { BaseSqliteStorageAdapter } from "./base/sqlite.js";

export interface TursoStorageAdapterOptions extends TursoDialectOptions {
  migrationsPrefix?: string;
}

export class TursoStorageAdapter extends BaseSqliteStorageAdapter {
  constructor(options: TursoStorageAdapterOptions) {
    super({
      dialect: new TursoDialect(options),
      migrationsPrefix: options.migrationsPrefix,
    });
  }
}
