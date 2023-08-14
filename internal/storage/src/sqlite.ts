import Database from "better-sqlite3";
import { Kysely, Migrator, SqliteDialect } from "kysely";

import { MigrationProvider } from "./migrations.js";
import { StorageAdapter } from "./storage-adapter.js";

export interface SqliteStorageAdapterOptions {
  db?: string;
  migrationsPrefix?: string;
}

export class SqliteStorageAdapter<T = {}> extends StorageAdapter {
  public readonly client: Kysely<T>;

  public readonly migrationsPrefix: string = "wt";

  constructor(options?: SqliteStorageAdapterOptions) {
    super();

    const db = new Database(options?.db ?? "db.sqlite");

    if (globalThis.process) {
      process.on("exit", () => db.close());
    }

    this.client = new Kysely<T>({
      dialect: new SqliteDialect({
        database: db,
      }),
    });
    this.migrationsPrefix = options?.migrationsPrefix ?? this.migrationsPrefix;
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
