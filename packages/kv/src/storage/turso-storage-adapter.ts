import { type ColumnType, type Migrations } from "@workertown/internal-storage";
import { TursoStorageAdapter as BaseTursoStorageAdapter } from "@workertown/internal-storage/turso-storage-adapter";

interface KeyValueTable {
  name: string;
  value: string;
  updated_at: ColumnType<Date | number, number, number>;
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
          .addColumn("name", "text", (col) => col.notNull())
          .addColumn("value", "text", (col) => col.notNull())
          .addColumn("updated_at", "integer", (col) => col.notNull())
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

export class TursoStorageAdapter extends BaseTursoStorageAdapter<DatabaseSchema> {
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
          updated_at: Date.now(),
        })
        .where("name", "=", key)
        .execute();
    } else {
      await this.client
        .insertInto("key_values")
        .values({
          name: key,
          value: JSON.stringify(value),
          updated_at: Date.now(),
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
