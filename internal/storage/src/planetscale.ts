import { Kysely, Migrator } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";

import { MigrationProvider } from "./migrations.js";
import { StorageAdapter } from "./storage-adapter.js";

export interface PlanetscaleStorageAdapterOptions {
  url?: string;
  username?: string;
  password?: string;
  migrationsPrefix?: string;
}

export class PlanetscaleStorageAdapter<T = {}> extends StorageAdapter {
  public readonly client: Kysely<T>;

  public readonly migrationsPrefix: string = "wt";

  constructor(options: PlanetscaleStorageAdapterOptions = {}) {
    super();

    this.client = new Kysely<T>({
      dialect: new PlanetScaleDialect(options),
    });
    this.migrationsPrefix = options.migrationsPrefix ?? this.migrationsPrefix;
  }

  public async runMigrations() {
    if (this.migrations.length > 0) {
      const migrator = new Migrator({
        db: this.client,
        provider: new MigrationProvider(this.migrations),
        migrationLockTableName: `${this.migrationsPrefix}_migrations_lock`,
        migrationTableName: `${this.migrationsPrefix}_migrations`,
      });

      return await migrator.migrateToLatest();
    }

    return { results: [] };
  }
}
