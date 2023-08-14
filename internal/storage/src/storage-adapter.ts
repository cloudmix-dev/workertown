import { type MigrationResultSet } from "kysely";

import { type Migrations } from "./migrations.js";

export class StorageAdapter {
  public readonly migrations: Migrations = [] as Migrations;

  public async runMigrations(): Promise<MigrationResultSet> {
    return { results: [] };
  }
}
