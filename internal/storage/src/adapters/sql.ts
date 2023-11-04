import { type Kysely, type MigrationResult, Migrator } from "kysely";

import { type Dialect } from "../dialects/dialect.js";
import { MigrationProvider } from "../migrations/migrations.js";
import { StorageAdapter } from "./storage-adapter.js";

interface SqlAdapterOptions<T> {
  dialect: Dialect<T>;
  migrationsPrefix?: string;
}

export class SqlStorageAdapter<
  T = Record<string, unknown>,
> extends StorageAdapter {
  public readonly client: Kysely<T>;

  public readonly migrationsPrefix: string = "wt";

  constructor(options: SqlAdapterOptions<T>) {
    super();

    this.client = options.dialect.client;
    this.migrationsPrefix = options.migrationsPrefix ?? this.migrationsPrefix;
  }

  public async runMigrations(down = false) {
    if (this.migrations.length > 0) {
      const migrator = new Migrator({
        db: this.client,
        provider: new MigrationProvider(this.migrations),
        migrationLockTableName: `${this.migrationsPrefix}_migrations_lock`,
        migrationTableName: `${this.migrationsPrefix}_migrations`,
      });

      if (!down) {
        return await migrator.migrateToLatest();
      } else {
        const allResults: MigrationResult[] = [];
        let error: unknown;

        try {
          let results;

          for (const _ of this.migrations) {
            ({ results, error } = await migrator.migrateDown());

            allResults.push(...(results as MigrationResult[]));

            if (error) {
              break;
            }
          }
        } catch (_) {
          error = (_ as Error).message;
        }

        return { results: allResults, error };
      }
    }

    return { results: [] };
  }
}
