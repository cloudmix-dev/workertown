import {
  type ColumnType,
  type Insertable,
  Kysely,
  type MigrationInfo,
  Migrator,
  type Selectable,
  type Updateable,
} from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";

import { DEFAULT_SORT_FIELD } from "../constants";
import { DefaultMigrationProvider } from "./migrations";
import { GetItemsOptions, Item, StorageAdapter } from "./storage-adapter";

interface SearchItemTable {
  id: string;
  tenant: string;
  index: string;
  data: string;
  created_at: ColumnType<Date | string, string, never>;
  updated_at: ColumnType<Date | string, string, string>;
}

export type SearchItem = Selectable<SearchItemTable>;
export type NewSearchItem = Insertable<SearchItemTable>;
export type SearchItemUpdate = Updateable<SearchItemTable>;

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
          .addColumn("id", "varchar", (col) => col.notNull())
          .addColumn("tenant", "varchar", (col) => col.notNull())
          .addColumn("index", "varchar", (col) => col.notNull())
          .addColumn("data", "varchar", (col) => col.notNull())
          .addColumn("created_at", "timestamp", (col) => col.notNull())
          .addColumn("updated_at", "timestamp", (col) => col.notNull())
          .execute();

        await db.schema
          .createTable("search_tags")
          .ifNotExists()
          .addColumn("id", "varchar", (col) => col.notNull())
          .addColumn("search_item_id", "varchar", (col) => col.notNull())
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
          .columns(["tenant", DEFAULT_SORT_FIELD])
          .execute();

        await db.schema
          .createIndex("search_items_tenant_index_idx")
          .ifNotExists()
          .on("search_items")
          .columns(["tenant", "index", DEFAULT_SORT_FIELD])
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

interface PlanetscaleStorageAdapterOptions {
  url?: string;
  username?: string;
  password?: string;
}

export class PlanetscaleStorageAdapter extends StorageAdapter {
  private readonly _client: Kysely<DatabaseSchema>;

  constructor(options: PlanetscaleStorageAdapterOptions = {}) {
    super();

    this._client = new Kysely<DatabaseSchema>({
      dialect: new PlanetScaleDialect(options),
    });
  }

  private _formatItem(item: SearchItem): Item {
    return {
      ...item,
      data: JSON.parse(item.data),
      createdAt: new Date(item.created_at as unknown as string),
      updatedAt: new Date(item.updated_at as unknown as string),
    };
  }

  async getItems(options: GetItemsOptions): Promise<Item[]> {
    const sortField = (options?.orderBy ?? "updated_at") as "updated_at";
    let query = this._client
      .selectFrom("search_items")
      .where("search_items.tenant", "=", options.tenant);

    if (options.index) {
      query = query.where("index", "=", options.index);
    }

    const records = await query
      .selectAll()
      .orderBy(`search_items.${sortField}`, "desc")
      .limit(options?.limit)
      .execute();

    return records.map((record) => this._formatItem(record));
  }

  async getItemsByTags(tags: string[], options: GetItemsOptions) {
    const sortField = (options?.orderBy ?? "updated_at") as "updated_at";
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
      .orderBy(`search_items.${sortField}`, "desc")
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
    item: Pick<Item, "id" | "tenant" | "index" | "data">,
    tags: string[] = []
  ) {
    const now = new Date();

    await this._client
      .insertInto("search_items")
      .values({
        ...item,
        data: JSON.stringify(item.data),
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .onConflict((oc) =>
        oc.columns(["id", "tenant", "index"]).doUpdateSet({
          ...item,
          data: JSON.stringify(item.data),
          updated_at: now.toISOString(),
        })
      )
      .execute();

    if (tags.length > 0) {
      await this._client
        .insertInto("search_tags")
        .ignore()
        .values(tags.map((tag) => ({ tag, search_item_id: item.id })))
        .execute();
    }

    return {
      ...item,
      createdAt: now,
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
