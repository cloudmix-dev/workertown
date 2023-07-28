import {
  type ColumnType,
  type Migrations,
  type Selectable,
} from "@workertown/internal-storage";
import { TursoStorageAdapter as BaseTursoStorageAdapter } from "@workertown/internal-storage/turso";

import {
  type Flag,
  type FlagCondition,
  StorageAdapter,
  type UpsertFlagBody,
} from "./storage-adapter.js";

interface FlagTable {
  name: string;
  description: string | null;
  conditions: string | null;
  disabled_at: ColumnType<Date | number, number, number> | null;
  created_at: ColumnType<Date | number, number, never>;
  updated_at: ColumnType<Date | number, number, number>;
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
          .addColumn("name", "text", (col) => col.notNull())
          .addColumn("description", "text")
          .addColumn("conditions", "text")
          .addColumn("disabled_at", "integer")
          .addColumn("created_at", "integer", (col) => col.notNull())
          .addColumn("updated_at", "integer", (col) => col.notNull())
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

export class TursoStorageAdapter
  extends BaseTursoStorageAdapter<DatabaseSchema>
  implements StorageAdapter
{
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

  public async upsertFlag(flag: UpsertFlagBody) {
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
          disabled_at: flag.enabled ? undefined : now.getTime(),
          created_at: now.getTime(),
          updated_at: now.getTime(),
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
          disabled_at: flag.enabled ? undefined : now.getTime(),
          updated_at: now.getTime(),
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
