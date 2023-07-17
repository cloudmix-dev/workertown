import { type Migrations } from "./migrations.js";

export class StorageAdapter {
  protected readonly _migrations: Migrations = [];

  async runMigrations(): Promise<void> {}
}
