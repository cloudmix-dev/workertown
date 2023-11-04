import {
  type ColumnType,
  type Migrations,
  type Selectable,
} from "@workertown/internal-storage";
import { SqlStorageAdapter } from "@workertown/internal-storage/sql";

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
  disabled_at: ColumnType<string, string, string> | null;
  created_at: ColumnType<string, string, never>;
  updated_at: ColumnType<string, string, string>;
}

type FlagRow = Selectable<FlagTable>;

export interface DatabaseSchema {
  wt_flags_flags: FlagTable;
}

const MIGRATIONS: Migrations = [
  {
    name: "1688823193041_add_initial_tables_and_indexes",
    migration: {
      async up(db) {
        await db.schema
          .createTable("wt_flags_flags")
          .addColumn("name", "varchar(255)", (col) => col.notNull())
          .addColumn("description", "varchar(255)")
          .addColumn("conditions", "varchar(255)")
          .addColumn("disabled_at", "timestamp")
          .addColumn("created_at", "timestamp", (col) => col.notNull())
          .addColumn("updated_at", "timestamp", (col) => col.notNull())
          .execute();

        await db.schema
          .createIndex("wt_flags_flags_name_idx")
          .unique()
          .on("wt_flags_flags")
          .columns(["name"])
          .execute();

        await db.schema
          .createIndex("wt_flags_flags_disabled_at_idx")
          .on("wt_flags_flags")
          .columns(["disabled_at"])
          .execute();
      },
      async down(db) {
        await db.schema.dropIndex("wt_flags_flags_disabled_at_idx").execute();

        await db.schema.dropIndex("wt_flags_flags_name_idx").execute();

        await db.schema.dropTable("wt_flags_flags").ifExists().execute();
      },
    },
  },
];

export class BasePostgresStorageAdapter
  extends SqlStorageAdapter<DatabaseSchema>
  implements StorageAdapter
{
  public readonly migrations = MIGRATIONS;

  public readonly migrationsPrefix = "wt_flags_flags";

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
    let query = this.client.selectFrom("wt_flags_flags").selectAll();

    if (!disabled) {
      query = query.where("disabled_at", "is", null);
    }

    const records = await query.orderBy("name").execute();

    return records.map((record) => this._formatFlag(record));
  }

  public async getFlag(name: string) {
    const record = await this.client
      .selectFrom("wt_flags_flags")
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
      .selectFrom("wt_flags_flags")
      .selectAll()
      .where("name", "=", flag.name)
      .executeTakeFirst();

    if (!existing) {
      await this.client
        .insertInto("wt_flags_flags")
        .values({
          name: flag.name,
          description: flag.description,
          conditions: flag.conditions
            ? JSON.stringify(flag.conditions)
            : undefined,
          disabled_at: flag.enabled
            ? undefined
            : now.toISOString().substring(0, 19).replace("T", " "),
          created_at: now.toISOString().substring(0, 19).replace("T", " "),
          updated_at: now.toISOString().substring(0, 19).replace("T", " "),
        })
        .execute();
    } else {
      await this.client
        .updateTable("wt_flags_flags")
        .where("name", "=", flag.name)
        .set({
          description: flag.description,
          conditions: flag.conditions
            ? JSON.stringify(flag.conditions)
            : undefined,
          disabled_at: flag.enabled
            ? undefined
            : now.toISOString().substring(0, 19).replace("T", " "),
          updated_at: now.toISOString().substring(0, 19).replace("T", " "),
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
    await this.client
      .deleteFrom("wt_flags_flags")
      .where("name", "=", name)
      .execute();
  }
}
