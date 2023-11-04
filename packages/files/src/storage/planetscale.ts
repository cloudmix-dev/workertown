import {
  PlanetscaleDialect,
  type PlanetscaleDialectOptions,
} from "@workertown/internal-storage/dialects/planetscale";

import { BaseMysqlStorageAdapter } from "./base/mysql.js";

export interface PlanetscaleStorageAdapterOptions
  extends PlanetscaleDialectOptions {
  migrationsPrefix?: string;
}

export class PlanetscaleStorageAdapter extends BaseMysqlStorageAdapter {
  constructor(options: PlanetscaleStorageAdapterOptions) {
    super({
      dialect: new PlanetscaleDialect(options),
      migrationsPrefix: options.migrationsPrefix,
    });
  }
}
