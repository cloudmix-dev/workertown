import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Kysely, Migrator } from "kysely";

import { MigrationProvider } from "./migrations.js";
import { StorageAdapter } from "./storage-adapter.js";

export interface TursoStorageAdapterOptions {
  url?: string;
  authToken?: string;
}

export class TursoStorageAdapter<T = {}> extends StorageAdapter {
  public readonly client: Kysely<T>;

  constructor(options: TursoStorageAdapterOptions = {}) {
    super();

    this.client = new Kysely<T>({
      dialect: new LibsqlDialect(options),
    });
  }

  public async runMigrations() {
    if (this.migrations.length > 0) {
      const migrator = new Migrator({
        db: this.client,
        provider: new MigrationProvider(this.migrations),
      });

      await migrator.migrateToLatest();
    }
  }
}
