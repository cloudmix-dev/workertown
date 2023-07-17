import { D1Database } from "@cloudflare/workers-types";
import { type Dialect, Kysely, Migrator } from "kysely";
import { D1Dialect } from "kysely-d1";

import { MigrationProvider } from "./migrations.js";
import { StorageAdapter } from "./storage-adapter.js";

interface D1StorageAdapterOptions {
  db: D1Database;
}

export class D1StorageAdapter<T = {}> extends StorageAdapter {
  protected readonly _client: Kysely<T>;

  constructor(options: D1StorageAdapterOptions) {
    super();

    this._client = new Kysely<T>({
      // The `as unknown as Dialect` is a workaround for a bug in the kysely-d1
      // types
      dialect: new D1Dialect({ database: options.db }) as unknown as Dialect,
    });
  }

  async runMigrations() {
    const migrator = new Migrator({
      db: this._client,
      provider: new MigrationProvider(this._migrations),
    });

    await migrator.migrateToLatest();
  }
}
