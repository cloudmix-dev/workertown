import { type MigrationResultSet } from "kysely";

import { type Migrations } from "./migrations.js";

export class StorageAdapter {
  public readonly migrations: Migrations = [] as Migrations;

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async runMigrations(down?: boolean): Promise<MigrationResultSet> {
    return { results: [] };
  }
}
