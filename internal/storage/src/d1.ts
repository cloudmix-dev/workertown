import { D1Database } from "@cloudflare/workers-types";
import { type Dialect, Kysely, type MigrationResult, Migrator } from "kysely";
import { D1Dialect } from "kysely-d1";

import { MigrationProvider } from "./migrations.js";
import { StorageAdapter } from "./storage-adapter.js";

interface D1StorageAdapterOptions {
  d1: D1Database;
  migrationsPrefix?: string;
}

export class D1StorageAdapter<T = {}> extends StorageAdapter {
  public readonly client: Kysely<T>;

  public readonly migrationsPrefix: string = "wt";

  constructor(options: D1StorageAdapterOptions) {
    super();

    this.client = new Kysely<T>({
      // The `as unknown as Dialect` is a workaround for a bug in the kysely-d1
      // types
      dialect: new D1Dialect({ database: options.d1 }) as unknown as Dialect,
    });
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
          for (const _migration of this.migrations) {
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
