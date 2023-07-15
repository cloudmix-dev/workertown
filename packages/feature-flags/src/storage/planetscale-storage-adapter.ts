import {
  type ColumnType,
  Kysely,
  type MigrationInfo,
  Migrator,
  type Selectable,
} from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";

import { DefaultMigrationProvider } from "./migrations.js";
import { Flag, FlagCondition, StorageAdapter } from "./storage-adapter.js";

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

const MIGRATIONS: MigrationInfo[] = [
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

interface PlanetscaleStorageAdapterOptions {
  url?: string;
  username?: string;
  password?: string;
}

export class PlanetscaleStorageAdapter extends StorageAdapter {
  private readonly _client: Kysely<DatabaseSchema>;

  constructor(options: PlanetscaleStorageAdapterOptions) {
    super();

    this._client = new Kysely<DatabaseSchema>({
      dialect: new PlanetScaleDialect(options),
    });
  }

  private _formatItem(flag: FlagRow): Flag {
    return {
      name: flag.name,
      description: flag.description === null ? undefined : flag.description,
      enabled: !Boolean(flag.disabled_at),
      conditions: flag.conditions
        ? (JSON.parse(flag.conditions) as FlagCondition[])
        : undefined,
      createdAt: new Date(flag.created_at),
      updatedAt: new Date(flag.updated_at),
    };
  }

  async getFlags(disabled?: boolean) {
    let query = this._client.selectFrom("flags").selectAll();

    if (!disabled) {
      query = query.where("disabled_at", "is", null);
    }

    const records = await query.execute();

    return records.map((record) => this._formatItem(record));
  }

  async getFlag(name: string) {
    const record = await this._client
      .selectFrom("flags")
      .selectAll()
      .where("name", "=", name)
      .executeTakeFirst();

    if (!record) {
      return null;
    }

    return this._formatItem(record);
  }

  async upsertFlag(
    flag: Pick<Flag, "name" | "description" | "enabled" | "conditions">
  ) {
    const now = new Date();
    const existing = await this._client
      .selectFrom("flags")
      .selectAll()
      .where("name", "=", flag.name)
      .executeTakeFirst();

    if (!existing) {
      await this._client
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
      await this._client
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

  async deleteFlag(name: string) {
    await this._client.deleteFrom("flags").where("name", "=", name).execute();
  }

  async runMigrations() {
    const migrator = new Migrator({
      db: this._client,
      provider: new DefaultMigrationProvider(MIGRATIONS),
    });

    await migrator.migrateToLatest();
  }
}
