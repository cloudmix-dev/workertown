import {
  type ColumnType,
  type Migrations,
  type Selectable,
} from "@workertown/internal-storage";
import { PlanetscaleStorageAdapter as BasePlanetscaleStorageAdapter } from "@workertown/internal-storage/planetscale-storage-adapter";

import { type Flag, type FlagCondition } from "./storage-adapter.js";

interface FlagTable {
  name: string;
  description: string | null;
  conditions: string | null;
  disabled_at: ColumnType<Date | string, string, string> | null;
  created_at: ColumnType<Date | string, string, never>;
  updated_at: ColumnType<Date | string, string, string>;
}

type FlagRow = Selectable<FlagTable>;

export interface DatabaseSchema {
  flags: FlagTable;
}

const MIGRATIONS: Migrations = [
  {
    name: "1688823193041_add_initial_tables_and_indexes",
    migration: {
      async up(db) {
        await db.schema
          .createTable("flags")
          .ifNotExists()
          .addColumn("name", "varchar", (col) => col.notNull())
          .addColumn("description", "varchar")
          .addColumn("conditions", "varchar")
          .addColumn("disabled_at", "timestamp")
          .addColumn("created_at", "timestamp", (col) => col.notNull())
          .addColumn("updated_at", "timestamp", (col) => col.notNull())
          .execute();

        await db.schema
          .createIndex("flags_name_idx")
          .unique()
          .ifNotExists()
          .on("flags")
          .columns(["name"])
          .execute();

        await db.schema
          .createIndex("flags_disabled_at_idx")
          .ifNotExists()
          .on("flags")
          .columns(["disabled_at"])
          .execute();
      },
      async down(db) {
        await db.schema.dropIndex("flags_disabled_at_idx").ifExists().execute();

        await db.schema.dropIndex("flags_name_idx").ifExists().execute();

        await db.schema.dropTable("flags").ifExists().execute();
      },
    },
  },
];

export class PlanetscaleStorageAdapter extends BasePlanetscaleStorageAdapter<DatabaseSchema> {
  public readonly migrations = MIGRATIONS;

  private _formatFlag(flag: FlagRow): Flag {
    return {
      name: flag.name,
      description: flag.description === null ? undefined : flag.description,
      enabled: !flag.disabled_at,
      conditions: flag.conditions
        ? (JSON.parse(flag.conditions) as FlagCondition[])
        : undefined,
      createdAt: new Date(flag.created_at),
      updatedAt: new Date(flag.updated_at),
    };
  }

  public async getFlags(disabled = false) {
    let query = this.client.selectFrom("flags").selectAll();

    if (!disabled) {
      query = query.where("disabled_at", "is", null);
    }

    const records = await query.execute();

    return records.map((record) => this._formatFlag(record));
  }

  public async getFlag(name: string) {
    const record = await this.client
      .selectFrom("flags")
      .selectAll()
      .where("name", "=", name)
      .executeTakeFirst();

    if (!record) {
      return null;
    }

    return this._formatFlag(record);
  }

  public async upsertFlag(
    flag: Pick<Flag, "name" | "description" | "enabled" | "conditions">,
  ) {
    const now = new Date();
    const existing = await this.client
      .selectFrom("flags")
      .selectAll()
      .where("name", "=", flag.name)
      .executeTakeFirst();

    if (!existing) {
      await this.client
        .insertInto("flags")
        .values({
          name: flag.name,
          description: flag.description,
          conditions: flag.conditions
            ? JSON.stringify(flag.conditions)
            : undefined,
          disabled_at: flag.enabled ? undefined : now.toISOString(),
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .execute();
    } else {
      await this.client
        .updateTable("flags")
        .where("name", "=", flag.name)
        .set({
          description: flag.description,
          conditions: flag.conditions
            ? JSON.stringify(flag.conditions)
            : undefined,
          disabled_at: flag.enabled ? undefined : now.toISOString(),
          updated_at: now.toISOString(),
        })
        .execute();
    }

    return {
      ...flag,
      createdAt: existing?.created_at ? new Date(existing.created_at) : now,
      updatedAt: now,
    };
  }

  public async deleteFlag(name: string) {
    await this.client.deleteFrom("flags").where("name", "=", name).execute();
  }
}
