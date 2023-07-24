import {
  type ColumnType,
  type Migrations,
  type Selectable,
} from "@workertown/internal-storage";
import { SqliteStorageAdapter as BaseSqliteStorageAdapter } from "@workertown/internal-storage/sqlite-storage-adapter";

import { StorageAdapter, type Subscription } from "./storage-adapter.js";

interface SubscriptionsTable {
  id: string;
  topic: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers: string | null;
  query_parameters: string | null;
  created_at: ColumnType<Date | number, number, never>;
}

type SubscriptionRow = Selectable<SubscriptionsTable>;

export interface DatabaseSchema {
  subscriptions: SubscriptionsTable;
}

const MIGRATIONS: Migrations = [
  {
    name: "1688823193041_add_initial_tables_and_indexes",
    migration: {
      async up(db) {
        await db.schema
          .createTable("subscriptions")
          .ifNotExists()
          .addColumn("id", "text", (col) => col.notNull())
          .addColumn("topic", "text", (col) => col.notNull())
          .addColumn("endpoint", "text", (col) => col.notNull())
          .addColumn("method", "text", (col) => col.notNull())
          .addColumn("headers", "text")
          .addColumn("query_parameters", "integer")
          .addColumn("created_at", "integer", (col) => col.notNull())
          .execute();

        await db.schema
          .createIndex("subscriptions_id_idx")
          .unique()
          .ifNotExists()
          .on("subscriptions")
          .columns(["id"])
          .execute();

        await db.schema
          .createIndex("subscriptions_topic_idx")
          .unique()
          .ifNotExists()
          .on("subscriptions")
          .columns(["topic"])
          .execute();
      },
      async down(db) {
        await db.schema
          .dropIndex("subscriptions_topic_idx")
          .ifExists()
          .execute();

        await db.schema.dropIndex("subscriptions_id_idx").ifExists().execute();

        await db.schema.dropTable("subscriptions").ifExists().execute();
      },
    },
  },
];

export class SqliteStorageAdapter
  extends BaseSqliteStorageAdapter<DatabaseSchema>
  implements StorageAdapter
{
  public readonly migrations = MIGRATIONS;

  private _formatSubscription(subscription: SubscriptionRow): Subscription {
    return {
      id: subscription.id,
      topic: subscription.topic,
      endpoint: subscription.endpoint,
      method: subscription.method,
      headers: subscription.headers
        ? JSON.parse(subscription.headers)
        : undefined,
      queryParameters: subscription.query_parameters
        ? JSON.parse(subscription.query_parameters)
        : undefined,
      createdAt: new Date(subscription.created_at),
    };
  }

  async getSubscriptions() {
    const records = await this.client
      .selectFrom("subscriptions")
      .selectAll()
      .execute();

    return records.map((record) => this._formatSubscription(record));
  }

  async getSubscriptionsByTopic(topic: string) {
    const records = await this.client
      .selectFrom("subscriptions")
      .selectAll()
      .where("topic", "=", topic)
      .execute();

    return records.map((record) => this._formatSubscription(record));
  }

  async createSubscription(
    subscription: Pick<
      Subscription,
      "topic" | "endpoint" | "method" | "headers" | "queryParameters"
    >,
  ) {
    const id = crypto.randomUUID();
    const now = new Date();

    await this.client
      .insertInto("subscriptions")
      .values({
        id,
        topic: subscription.topic,
        endpoint: subscription.endpoint,
        method: subscription.method,
        headers: subscription.headers
          ? JSON.stringify(subscription.headers)
          : null,
        query_parameters: subscription.queryParameters
          ? JSON.stringify(subscription)
          : null,
        created_at: now.getTime(),
      })
      .execute();

    return {
      ...subscription,
      id,
      createdAt: now,
    };
  }

  async deleteSubscription(id: string) {
    await this.client
      .deleteFrom("subscriptions")
      .where("id", "=", id)
      .execute();
  }
}
