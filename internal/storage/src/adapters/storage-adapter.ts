import { type MigrationResultSet } from "kysely";

import { type Migrations } from "../migrations/migrations.js";

export class StorageAdapter {
  public readonly migrations: Migrations = [] as Migrations;

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async runMigrations(down?: boolean): Promise<MigrationResultSet> {
    return { results: [] };
  }
}
