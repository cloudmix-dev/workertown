import {
  type MigrationProvider as BaseMigrationProvider,
  type MigrationInfo,
} from "kysely";

export { type MigrationInfo as Migration };

export type Migrations = MigrationInfo[];

export class MigrationProvider implements BaseMigrationProvider {
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
