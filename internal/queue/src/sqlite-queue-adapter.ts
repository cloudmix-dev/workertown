import { type Message } from "@cloudflare/workers-types";
import { MigrationProvider } from "@workertown/internal-storage";
import Database from "better-sqlite3";
import {
  type ColumnType,
  Kysely,
  type MigrationInfo,
  Migrator,
  type Selectable,
  SqliteDialect,
} from "kysely";

import { QueueAdapter, type QueueMessage } from "./queue-adapter.js";

interface QueueMessagesTable {
  id: string;
  body: string;
  timestamp: ColumnType<Date | number, number, number>;
}

type QueueMessageRow = Selectable<QueueMessagesTable>;

export interface DatabaseSchema {
  queue_messages: QueueMessagesTable;
}

const MIGRATIONS: MigrationInfo[] = [
  {
    name: "1688823193041_add_initial_tables_and_indexes",
    migration: {
      async up(db) {
        await db.schema
          .createTable("queue_messages")
          .ifNotExists()
          .addColumn("id", "text", (col) => col.notNull())
          .addColumn("body", "text", (col) => col.notNull())
          .addColumn("timestamp", "integer", (col) => col.notNull())
          .execute();

        await db.schema
          .createIndex("queue_messages_id_idx")
          .unique()
          .ifNotExists()
          .on("queue_messages")
          .columns(["id"])
          .execute();

        await db.schema
          .createIndex("queue_messages_timestamp_idx")
          .unique()
          .ifNotExists()
          .on("queue_messages")
          .columns(["timestamp"])
          .execute();
      },
      async down(db) {
        await db.schema
          .dropIndex("queue_messages_timestamp_idx")
          .ifExists()
          .execute();

        await db.schema.dropIndex("queue_messages_id_idx").ifExists().execute();

        await db.schema.dropTable("queue_messages").ifExists().execute();
      },
    },
  },
];

interface SqliteQueueAdapterOptions {
  db: string;
}

export class SqliteQueueAdapter extends QueueAdapter {
  private readonly _client: Kysely<DatabaseSchema>;

  constructor(options?: SqliteQueueAdapterOptions) {
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

  private _formatQueueMessage(
    queueMessage: QueueMessageRow,
  ): Pick<Message<QueueMessage>, "id" | "body" | "timestamp"> {
    return {
      id: queueMessage.id,
      body: JSON.parse(queueMessage.body),
      timestamp: new Date(queueMessage.timestamp),
    };
  }

  // rome-ignore lint/suspicious/noExplicitAny: Need to allow any type of body
  async sendMessage(body: any): Promise<void> {
    await this._client
      .insertInto("queue_messages")
      .values({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        body: JSON.stringify(body),
      })
      .execute();
  }

  // rome-ignore lint/suspicious/noExplicitAny: Need to allow any type of body
  async sendMessages(bodies: any[]): Promise<void> {
    if (bodies.length > 0) {
      await this._client
        .insertInto("queue_messages")
        .values(
          bodies.map((body) => ({
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            body: JSON.stringify(body),
          })),
        )
        .execute();
    }
  }

  async pullMessages(): Promise<QueueMessage[]> {
    const messages = await this._client
      .selectFrom("queue_messages")
      .selectAll()
      .orderBy("timestamp", "asc")
      .execute();

    return messages.map((message) => this._formatQueueMessage(message).body);
  }

  async ackMessage(id: string): Promise<void> {
    await this._client
      .deleteFrom("queue_messages")
      .where("id", "=", id)
      .execute();
  }

  async retryMessage(id: string, delay?: number): Promise<void> {
    await this._client
      .updateTable("queue_messages")
      .set({
        timestamp: Date.now() + (delay ?? 0),
      })
      .where("id", "=", id)
      .execute();
  }

  async runMigrations() {
    const migrator = new Migrator({
      db: this._client,
      provider: new MigrationProvider(MIGRATIONS),
    });

    await migrator.migrateToLatest();
  }
}
