import { type ColumnType, type Migrations } from "@workertown/internal-storage";
import { PlanetscaleStorageAdapter as BasePlanetscaleStorageAdapter } from "@workertown/internal-storage/planetscale-storage-adapter";

interface KeyValueTable {
  name: string;
  value: string;
  updated_at: ColumnType<Date | string, string, string>;
}

export interface DatabaseSchema {
  key_values: KeyValueTable;
}

const MIGRATIONS: Migrations = [
  {
    name: "1688823193041_add_initial_tables_and_indexes",
    migration: {
      async up(db) {
        await db.schema
          .createTable("key_values")
          .ifNotExists()
          .addColumn("name", "varchar", (col) => col.notNull())
          .addColumn("value", "varchar", (col) => col.notNull())
          .addColumn("updated_at", "timestamp", (col) => col.notNull())
          .execute();

        await db.schema
          .createIndex("key_values_name_idx")
          .unique()
          .ifNotExists()
          .on("key_values")
          .columns(["name"])
          .execute();
      },
      async down(db) {
        await db.schema.dropIndex("key_values_name_idx").ifExists().execute();

        await db.schema.dropTable("key_values").ifExists().execute();
      },
    },
  },
];

export class PlanetscaleStorageAdapter extends BasePlanetscaleStorageAdapter<DatabaseSchema> {
  public readonly migrations = MIGRATIONS;

  public async getValue<T = unknown>(key: string) {
    const record = await this.client
      .selectFrom("key_values")
      .where("name", "=", key)
      .select("value")
      .executeTakeFirst();

    if (!record) {
      return null;
    }

    return JSON.parse(record.value) as T;
  }

  public async setValue<T = unknown>(key: string, value: T) {
    const now = new Date();
    const existing = await this.client
      .selectFrom("key_values")
      .where("name", "=", key)
      .select("value")
      .executeTakeFirst();

    if (existing) {
      await this.client
        .updateTable("key_values")
        .set({
          value: JSON.stringify(value),
          updated_at: now.toISOString(),
        })
        .where("name", "=", key)
        .execute();
    } else {
      await this.client
        .insertInto("key_values")
        .values({
          name: key,
          value: JSON.stringify(value),
          updated_at: now.toISOString(),
        })
        .execute();
    }

    return value;
  }

  public async deleteValue(key: string) {
    await this.client
      .deleteFrom("key_values")
      .where("name", "=", key)
      .execute();
  }
}
