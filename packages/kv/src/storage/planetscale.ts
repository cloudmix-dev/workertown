import { type ColumnType, type Migrations } from "@workertown/internal-storage";
import { PlanetscaleStorageAdapter as BasePlanetscaleStorageAdapter } from "@workertown/internal-storage/planetscale";

import { type StorageAdapter } from "./storage-adapter.js";

interface KeyValueTable {
  name: string;
  value: string;
  updated_at: ColumnType<Date | string, string, string>;
}

export interface DatabaseSchema {
  wt_kv_key_values: KeyValueTable;
}

const MIGRATIONS: Migrations = [
  {
    name: "1688823193041_add_initial_tables_and_indexes",
    migration: {
      async up(db) {
        await db.schema
          .createTable("wt_kv_key_values")
          .ifNotExists()
          .addColumn("name", "varchar(255)", (col) => col.notNull())
          .addColumn("value", "varchar(255)", (col) => col.notNull())
          .addColumn("updated_at", "timestamp", (col) => col.notNull())
          .execute();

        await db.schema
          .createIndex("wt_kv_key_values_name_idx")
          .unique()
          .ifNotExists()
          .on("wt_kv_key_values")
          .columns(["name"])
          .execute();
      },
      async down(db) {
        await db.schema
          .dropIndex("wt_kv_key_values_name_idx")
          .ifExists()
          .execute();

        await db.schema.dropTable("wt_kv_key_values").ifExists().execute();
      },
    },
  },
];

export class PlanetscaleStorageAdapter
  extends BasePlanetscaleStorageAdapter<DatabaseSchema>
  implements StorageAdapter
{
  public readonly migrations = MIGRATIONS;

  public readonly migrationsPrefix = "wt_kv";

  public async getValue<T = unknown>(key: string) {
    const record = await this.client
      .selectFrom("wt_kv_key_values")
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
      .selectFrom("wt_kv_key_values")
      .where("name", "=", key)
      .select("value")
      .executeTakeFirst();

    if (existing) {
      await this.client
        .updateTable("wt_kv_key_values")
        .set({
          value: JSON.stringify(value),
          updated_at: now.toISOString().substring(0, 19).replace("T", " "),
        })
        .where("name", "=", key)
        .execute();
    } else {
      await this.client
        .insertInto("wt_kv_key_values")
        .values({
          name: key,
          value: JSON.stringify(value),
          updated_at: now.toISOString().substring(0, 19).replace("T", " "),
        })
        .execute();
    }

    return value;
  }

  public async deleteValue(key: string) {
    await this.client
      .deleteFrom("wt_kv_key_values")
      .where("name", "=", key)
      .execute();
  }
}
