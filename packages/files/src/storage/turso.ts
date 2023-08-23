import {
  type ColumnType,
  type Migrations,
  type Selectable,
} from "@workertown/internal-storage";
import { TursoStorageAdapter as BaseTursoStorageAdapter } from "@workertown/internal-storage/turso";

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
  expires_at: ColumnType<number, number, number>;
  created_at: ColumnType<number, number, never>;
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
          .addColumn("id", "text", (col) => col.notNull())
          .addColumn("path", "text", (col) => col.notNull())
          .addColumn("callback_url", "text")
          .addColumn("metadata", "text")
          .addColumn("expires_at", "integer", (col) => col.notNull())
          .addColumn("created_at", "integer", (col) => col.notNull())
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

export class TursoStorageAdapter
  extends BaseTursoStorageAdapter<DatabaseSchema>
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
        expires_at: url.expiresAt.getTime(),
        created_at: now.getTime(),
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
