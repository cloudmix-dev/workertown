import { type MigrationInfo, type MigrationProvider } from "kysely";

export class DefaultMigrationProvider implements MigrationProvider {
  private readonly _migrations: MigrationInfo[];

  constructor(migrations: MigrationInfo[]) {
    this._migrations = migrations;
  }

  async getMigrations() {
    return Object.fromEntries(
      this._migrations.map((migration) => [migration.name, migration.migration])
    );
  }
}
