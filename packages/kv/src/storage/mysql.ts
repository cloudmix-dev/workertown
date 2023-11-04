import {
  MysqlDialect,
  type MysqlDialectOptions,
} from "@workertown/internal-storage/dialects/mysql";

import { BaseMysqlStorageAdapter } from "./base-mysql.js";

export interface MysqlStorageAdapterOptions extends MysqlDialectOptions {
  migrationsPrefix?: string;
}

export class MysqlStorageAdapter extends BaseMysqlStorageAdapter {
  constructor(options: MysqlStorageAdapterOptions) {
    super({
      dialect: new MysqlDialect(options),
      migrationsPrefix: options.migrationsPrefix,
    });
  }
}
