import Database from "better-sqlite3";
import {
  type ColumnType,
  Kysely,
  type MigrationInfo,
  Migrator,
  SqliteDialect,
} from "kysely";

import { DefaultMigrationProvider } from "./migrations.js";
import { StorageAdapter } from "./storage-adapter.js";

interface KeyValueTable {
  name: string;
  value: string;
  updated_at: ColumnType<Date | number, number, number>;
}

export interface DatabaseSchema {
  key_values: KeyValueTable;
}

const MIGRATIONS: MigrationInfo[] = [
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

interface SqliteStorageAdapterOptions {
  db: string;
}

export class SqliteStorageAdapter extends StorageAdapter {
  private readonly _client: Kysely<DatabaseSchema>;

  constructor(options?: SqliteStorageAdapterOptions) {
    super();

    const db = new Database(options?.db ?? "db.sqlite");

    if (globalThis.process) {
      process.on("exit", () => db.close());
    }

    this._client = new Kysely<DatabaseSchema>({
      dialect: new SqliteDialect({
        database: db,
      }),
    });
  }

  async getValue<T = any>(key: string) {
    const record = await this._client
      .selectFrom("key_values")
      .where("name", "=", key)
      .select("value")
      .executeTakeFirst();

    if (!record) {
      return null;
    }

    return JSON.parse(record.value) as T;
  }

  async setValue<T = any>(key: string, value: T) {
    const existing = await this._client
      .selectFrom("key_values")
      .where("name", "=", key)
      .select("value")
      .executeTakeFirst();

    if (existing) {
      await this._client
        .updateTable("key_values")
        .set({
          value: JSON.stringify(value),
          updated_at: Date.now(),
        })
        .where("name", "=", key)
        .execute();
    } else {
      await this._client
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

  async deleteValue(key: string) {
    await this._client
      .deleteFrom("key_values")
      .where("name", "=", key)
      .execute();
  }

  async runMigrations() {
    const migrator = new Migrator({
      db: this._client,
      provider: new DefaultMigrationProvider(MIGRATIONS),
    });

    await migrator.migrateToLatest();
  }
}
