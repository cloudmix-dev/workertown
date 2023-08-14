import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Kysely, Migrator } from "kysely";

import { MigrationProvider } from "./migrations.js";
import { StorageAdapter } from "./storage-adapter.js";

export interface TursoStorageAdapterOptions {
  url?: string;
  authToken?: string;
  migrationsPrefix?: string;
}

export class TursoStorageAdapter<T = {}> extends StorageAdapter {
  public readonly client: Kysely<T>;

  public readonly migrationsPrefix: string = "wt";

  constructor(options: TursoStorageAdapterOptions = {}) {
    super();

    this.client = new Kysely<T>({
      dialect: new LibsqlDialect(options),
    });
    this.migrationsPrefix = options.migrationsPrefix ?? this.migrationsPrefix;
  }

  public async runMigrations() {
    if (this.migrations.length > 0) {
      const migrator = new Migrator({
        db: this.client,
        provider: new MigrationProvider(this.migrations),
        migrationLockTableName: `${this.migrationsPrefix}.migrations_lock`,
        migrationTableName: `${this.migrationsPrefix}.migrations`,
      });

      return await migrator.migrateToLatest();
    }

    return { results: [] };
  }
}
