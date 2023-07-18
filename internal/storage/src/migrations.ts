import {
  type MigrationInfo,
  type MigrationProvider as BaseMigrationProvider,
} from "kysely";

export { type MigrationInfo as Migration };

export type Migrations = MigrationInfo[];

export class MigrationProvider implements BaseMigrationProvider {
  private readonly _migrations: Migrations;

  constructor(migrations: Migrations) {
    this._migrations = migrations;
  }

  async getMigrations() {
    return Object.fromEntries(
      this._migrations.map((migration) => [
        migration.name,
        migration.migration,
      ]),
    );
  }
}
