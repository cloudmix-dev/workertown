import { D1Database } from "@cloudflare/workers-types";
import { type Dialect, Kysely, Migrator } from "kysely";
import { D1Dialect } from "kysely-d1";

import { MigrationProvider } from "./migrations.js";
import { StorageAdapter } from "./storage-adapter.js";

interface D1StorageAdapterOptions {
  d1: D1Database;
}

export class D1StorageAdapter<T = {}> extends StorageAdapter {
  public readonly client: Kysely<T>;

  constructor(options: D1StorageAdapterOptions) {
    super();

    this.client = new Kysely<T>({
      // The `as unknown as Dialect` is a workaround for a bug in the kysely-d1
      // types
      dialect: new D1Dialect({ database: options.d1 }) as unknown as Dialect,
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
