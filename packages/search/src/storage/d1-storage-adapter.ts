import { D1Database } from "@cloudflare/workers-types";
import { Kysely, sql } from "kysely";
import { D1Dialect } from "kysely-d1";
import { DEFAULT_SORT_FIELD } from "src/constants";

import { GetItemsOptions, Item, StorageAdapter } from "./storage-adapter";

interface SearchItemRecord {
  id: string;
  tenant: string;
  index: string;
  data: string;
  created_at: number;
  updated_at: number;
}

interface SearchTagRecord {
  tag: string;
  search_item_id: string;
}

export interface DatabaseSchema {
  search_items: SearchItemRecord;
  search_tags: SearchTagRecord;
}

const MIGRATIONS = [
  "CREATE TABLE IF NOT EXISTS `search_items` (`id` text NOT NULL, `tenant` text NOT NULL, `index` text NOT NULL, `data` text NOT NULL, `created_at` integer NOT NULL, `updated_at` integer NOT NULL);",
  "CREATE TABLE IF NOT EXISTS `search_tags` (`tag` text NOT NULL,`search_item_id` text NOT NULL);",
  "CREATE UNIQUE INDEX IF NOT EXISTS `search_items_id_idx` ON `search_items` (`id`);",
  `CREATE INDEX IF NOT EXISTS \`search_items_tenant_idx\` ON \`search_items\` (\`tenant\`, \`${DEFAULT_SORT_FIELD}\`);`,
  `CREATE INDEX IF NOT EXISTS \`search_items_tenant_index_idx\` ON \`search_items\` (\`tenant\`, \`index\`, \`${DEFAULT_SORT_FIELD}\`);`,
  "CREATE UNIQUE INDEX IF NOT EXISTS `search_tags_unique_idx` ON `search_tags` (`tag`,`search_item_id`);",
];

export class D1StorageAdapter extends StorageAdapter {
  private readonly _client: Kysely<DatabaseSchema>;

  private readonly _db: D1Database;

  constructor(db: D1Database) {
    super();

    this._client = new Kysely<DatabaseSchema>({
      dialect: new D1Dialect({ database: db }),
    });
    this._db = db;
  }

  private _formatItem(item: SearchItemRecord): Item {
    return {
      ...item,
      data: JSON.parse(item.data),
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
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
    const [result] = await this._client
      .selectFrom("search_items")
      .selectAll()
      .where("id", "=", id)
      .limit(1)
      .execute();

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
        created_at: now.getTime(),
        updated_at: now.getTime(),
      })
      .onConflict((oc) =>
        oc.columns(["id", "tenant", "index"]).doUpdateSet({
          ...item,
          data: JSON.stringify(item.data),
          updated_at: now.getTime(),
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
    const tags = this._client
      .selectFrom("search_tags")
      // @ts-ignore
      .select(sql`distinct search_items.tags`)
      .execute();

    return tags as unknown as string[];
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
    for (const migration of MIGRATIONS) {
      await this._db.exec(migration);
    }
  }

  getMigrations() {
    return MIGRATIONS.join("\n");
  }
}
