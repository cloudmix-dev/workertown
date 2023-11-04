import {
  type ColumnType,
  type Migrations,
  type Selectable,
  sql,
} from "@workertown/internal-storage";
import { SqlStorageAdapter } from "@workertown/internal-storage/sql";

import {
  type CreateUploadUrlBody,
  StorageAdapter,
  type UploadUrl,
} from "./storage-adapter.js";

interface UploadUrlTable {
  id: string;
  path: string;
  callback_url: string | null;
  metadata: string | null;
  expires_at: ColumnType<string, string, never>;
  created_at: ColumnType<string, string, string>;
}

type UploadUrlTableRow = Selectable<UploadUrlTable>;

export interface DatabaseSchema {
  wt_files_upload_urls: UploadUrlTable;
}

const MIGRATIONS: Migrations = [
  {
    name: "1688823193041_add_initial_tables_and_indexes",
    migration: {
      async up(db) {
        await db.schema
          .createTable("wt_files_upload_urls")
          .ifNotExists()
          .addColumn("id", "varchar(255)", (col) => col.notNull())
          .addColumn("path", "varchar(255)", (col) => col.notNull())
          .addColumn("callback_url", "varchar(255)")
          .addColumn("metadata", "varchar(255)")
          .addColumn("expires_at", "timestamp", (col) => col.notNull())
          .addColumn("created_at", "timestamp", (col) =>
            col.defaultTo(sql`now()`).notNull(),
          )
          .execute();

        await db.schema
          .createIndex("wt_files_id_idx")
          .unique()
          .ifNotExists()
          .on("wt_files_upload_urls")
          .columns(["id"])
          .execute();
      },
      async down(db) {
        await db.schema.dropIndex("wt_files_id_idx").ifExists().execute();

        await db.schema.dropTable("wt_files_upload_urls").ifExists().execute();
      },
    },
  },
];

export class BasePostgresStorageAdapter
  extends SqlStorageAdapter<DatabaseSchema>
  implements StorageAdapter
{
  public readonly migrations = MIGRATIONS;

  public readonly migrationsPrefix = "wt_files";

  private _formatUploadUrl(url: UploadUrlTableRow): UploadUrl {
    return {
      id: url.id,
      path: url.path,
      callbackUrl: url.callback_url ?? undefined,
      metadata: url.metadata ? JSON.parse(url.metadata) : undefined,
      expiresAt: new Date(url.expires_at),
      createdAt: new Date(url.created_at),
    };
  }

  public async getUploadUrl(id: string) {
    const url = await this.client
      .selectFrom("wt_files_upload_urls")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (!url) {
      return null;
    }

    return this._formatUploadUrl(url);
  }

  public async createUploadUrl(url: CreateUploadUrlBody) {
    const id = crypto.randomUUID();
    const now = new Date();

    await this.client
      .insertInto("wt_files_upload_urls")
      .values({
        id,
        path: url.path,
        callback_url: url.callbackUrl,
        metadata: url.metadata ? JSON.stringify(url.metadata) : null,
        expires_at: url.expiresAt.toISOString().slice(0, 19).replace("T", " "),
        created_at: now.toISOString().slice(0, 19).replace("T", " "),
      })
      .execute();

    return {
      id,
      path: url.path,
      callbackUrl: url.callbackUrl ?? undefined,
      metadata: url.metadata ?? undefined,
      expiresAt: url.expiresAt,
      createdAt: now,
    };
  }

  public async deleteUploadUrl(id: string) {
    await this.client
      .deleteFrom("wt_files_upload_urls")
      .where("id", "=", id)
      .execute();
  }
}
