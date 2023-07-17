import { Kysely, Migrator } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";

import { MigrationProvider } from "./migrations.js";
import { StorageAdapter } from "./storage-adapter.js";

interface PlanetscaleStorageAdapterOptions {
  url?: string;
  username?: string;
  password?: string;
}

export class PlanetscaleStorageAdapter<T = {}> extends StorageAdapter {
  public readonly client: Kysely<T>;

  constructor(options: PlanetscaleStorageAdapterOptions = {}) {
    super();

    this.client = new Kysely<T>({
      dialect: new PlanetScaleDialect(options),
    });
  }

  public async runMigrations() {
    const migrator = new Migrator({
      db: this.client,
      provider: new MigrationProvider(this.migrations),
    });

    await migrator.migrateToLatest();
  }
}
