import Database from "better-sqlite3";
import {
  type ColumnType,
  Kysely,
  type MigrationInfo,
  Migrator,
  type Selectable,
  SqliteDialect,
} from "kysely";

import { DEFAULT_SORT_FIELD } from "../constants";
import { DefaultMigrationProvider } from "./migrations";
import { GetItemsOptions, SearchItem, StorageAdapter } from "./storage-adapter";

interface SearchItemTable {
  id: string;
  tenant: string;
  index: string;
  data: string;
  created_at: ColumnType<Date | number, number, never>;
  updated_at: ColumnType<Date | number, number, number>;
}

type SearchItemRow = Selectable<SearchItemTable>;

interface SearchTagTable {
  tag: string;
  search_item_id: string;
}

export interface DatabaseSchema {
  search_items: SearchItemTable;
  search_tags: SearchTagTable;
}

const MIGRATIONS: MigrationInfo[] = [
  {
    name: "1688823193041_add_initial_tables_and_indexes",
    migration: {
      async up(db) {
        await db.schema
          .createTable("search_items")
          .ifNotExists()
          .addColumn("id", "text", (col) => col.notNull())
          .addColumn("tenant", "text", (col) => col.notNull())
          .addColumn("index", "text", (col) => col.notNull())
          .addColumn("data", "text", (col) => col.notNull())
          .addColumn("created_at", "integer", (col) => col.notNull())
          .addColumn("updated_at", "integer", (col) => col.notNull())
          .execute();

        await db.schema
          .createTable("search_tags")
          .ifNotExists()
          .addColumn("tag", "text", (col) => col.notNull())
          .addColumn("search_item_id", "text", (col) => col.notNull())
          .execute();

        await db.schema
          .createIndex("search_items_id_idx")
          .unique()
          .ifNotExists()
          .on("search_items")
          .columns(["id"])
          .execute();

        await db.schema
          .createIndex("search_items_tenant_idx")
          .ifNotExists()
          .on("search_items")
          .columns(["tenant", DEFAULT_SORT_FIELD, "id"])
          .execute();

        await db.schema
          .createIndex("search_items_tenant_index_idx")
          .ifNotExists()
          .on("search_items")
          .columns(["tenant", "index", DEFAULT_SORT_FIELD, "id"])
          .execute();

        await db.schema
          .createIndex("search_tags_unique_idx")
          .unique()
          .ifNotExists()
          .on("search_tags")
          .columns(["tag", "search_item_id"])
          .execute();
      },
      async down(db) {
        await db.schema
          .dropIndex("search_tags_unique_idx")
          .ifExists()
          .execute();

        await db.schema
          .dropIndex("search_items_tenant_index_idx")
          .ifExists()
          .execute();

        await db.schema
          .dropIndex("search_items_tenant_idx")
          .ifExists()
          .execute();

        await db.schema.dropIndex("search_items_id_idx").ifExists().execute();

        await db.schema.dropTable("search_tags").ifExists().execute();

        await db.schema.dropTable("search_items").ifExists().execute();
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

  private _formatItem(item: SearchItemRow): SearchItem {
    return {
      id: item.id,
      tenant: item.tenant,
      index: item.index,
      data: JSON.parse(item.data),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    };
  }

  async getItems(options: GetItemsOptions): Promise<SearchItem[]> {
    let query = this._client
      .selectFrom("search_items")
      .where("search_items.tenant", "=", options.tenant);

    if (options.index) {
      query = query.where("index", "=", options.index);
    }

    const records = await query
      .selectAll()
      .orderBy("search_items.updated_at", "desc")
      .limit(options?.limit)
      .execute();

    return records.map((record) => this._formatItem(record));
  }

  async getItemsByTags(tags: string[], options: GetItemsOptions) {
    let query = this._client
      .selectFrom("search_tags")
      .innerJoin(
        "search_items",
        "search_tags.search_item_id",
        "search_items.id"
      )
      .where("search_tags.tag", "in", tags)
      .where("search_items.tenant", "=", options.tenant);

    if (options?.index) {
      query = query.where("search_items.index", "=", options.index);
    }

    const records = await query
      .selectAll("search_items")
      .groupBy("search_items.id")
      .having((eb) => eb.fn.count("search_items.id"), "=", tags.length)
      .orderBy("search_items.updated_at", "desc")
      .limit(options?.limit)
      .execute();

    return records.map((record) => this._formatItem(record));
  }

  async getItem(id: string) {
    const result = await this._client
      .selectFrom("search_items")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return this._formatItem(result);
  }

  async indexItem(
    item: Pick<SearchItem, "id" | "tenant" | "index" | "data">,
    tags: string[] = []
  ) {
    const now = new Date();
    const existing = await this._client
      .selectFrom("search_items")
      .select(["id", "created_at"])
      .where("id", "=", item.id)
      .where("tenant", "=", item.tenant)
      .where("index", "=", item.index)
      .executeTakeFirst();

    if (!existing) {
      await this._client
        .insertInto("search_items")
        .values({
          ...item,
          data: JSON.stringify(item.data),
          created_at: now.getTime(),
          updated_at: now.getTime(),
        })
        .execute();
    } else {
      await this._client
        .updateTable("search_items")
        .where("id", "=", item.id)
        .where("tenant", "=", item.tenant)
        .where("index", "=", item.index)
        .set({
          data: JSON.stringify(item.data),
          updated_at: now.getTime(),
        })
        .execute();
    }

    if (tags.length > 0) {
      const existingTags = await this._client
        .selectFrom("search_tags")
        .selectAll()
        .where("search_item_id", "=", item.id)
        .execute();
      const tagsToAdd = tags.filter(
        (tag) =>
          existingTags.find((existingTag) => existingTag.tag === tag) ===
          undefined
      );
      const tagsToRemove = existingTags.filter(
        (existingTag) =>
          tags.find((tag) => tag === existingTag.tag) === undefined
      );

      if (tagsToAdd.length > 0) {
        await this._client
          .insertInto("search_tags")
          .values(tagsToAdd.map((tag) => ({ tag, search_item_id: item.id })))
          .execute();
      }

      if (tagsToRemove.length > 0) {
        await this._client
          .deleteFrom("search_tags")
          .where("search_item_id", "=", item.id)
          .where(
            "tag",
            "in",
            tagsToRemove.map((tag) => tag.tag)
          )
          .execute();
      }
    }

    return {
      ...item,
      createdAt: existing?.created_at ? new Date(existing.created_at) : now,
      updatedAt: now,
    };
  }

  async deleteItem(id: string) {
    await this._client
      .deleteFrom("search_items")
      .where("id", "=", id)
      .execute();
    await this._client
      .deleteFrom("search_tags")
      .where("search_item_id", "=", id)
      .execute();
  }

  async getTags() {
    const tags = await this._client
      .selectFrom("search_tags")
      .select("tag")
      .distinct()
      .execute();

    return tags.map(({ tag }) => tag);
  }

  async tagItem(id: string, tag: string) {
    await this._client
      .insertInto("search_tags")
      .onConflict((oc) => oc.columns(["search_item_id", "tag"]).doNothing())
      .values({ search_item_id: id, tag })
      .execute();
  }

  async untagItem(id: string, tag: string) {
    await this._client
      .deleteFrom("search_tags")
      .where("search_item_id", "=", id)
      .where("tag", "=", tag)
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
