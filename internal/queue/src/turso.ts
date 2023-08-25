import { type Message } from "@cloudflare/workers-types";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { MigrationProvider } from "@workertown/internal-storage";
import {
  type ColumnType,
  Kysely,
  type MigrationInfo,
  type MigrationResult,
  Migrator,
  type Selectable,
} from "kysely";

import { QueueAdapter, type QueueMessage } from "./queue-adapter.js";

interface QueueMessagesTable {
  id: string;
  body: string;
  attempts: number;
  timestamp: ColumnType<number, number, never>;
  dlq_at: ColumnType<number, number, number> | null;
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
          .addColumn("attempts", "integer", (col) => col.notNull())
          .addColumn("timestamp", "integer", (col) => col.notNull())
          .addColumn("dlq_at", "integer")
          .execute();

        await db.schema
          .createIndex("queue_messages_id_idx")
          .unique()
          .ifNotExists()
          .on("queue_messages")
          .columns(["id"])
          .execute();

        await db.schema
          .createIndex("queue_messages_dlq_at_timestamp_id_idx")
          .unique()
          .ifNotExists()
          .on("queue_messages")
          .columns(["dlq_at", "timestamp", "id"])
          .execute();
      },
      async down(db) {
        await db.schema
          .dropIndex("queue_messages_dlq_at_timestamp_id_idx")
          .ifExists()
          .execute();

        await db.schema.dropIndex("queue_messages_id_idx").ifExists().execute();

        await db.schema.dropTable("queue_messages").ifExists().execute();
      },
    },
  },
];

interface TursoQueueAdapterOptions {
  url?: string;
  authToken?: string;
  maxRetries?: number;
  migrationsPrefix?: string;
}

export class TursoQueueAdapter extends QueueAdapter {
  private readonly _client: Kysely<DatabaseSchema>;

  private readonly _maxRetries: number;

  private readonly _migrationsPrefix: string = "wt_queue";

  constructor(options: TursoQueueAdapterOptions = {}) {
    super();

    this._client = new Kysely<DatabaseSchema>({
      dialect: new LibsqlDialect(options),
    });
    this._maxRetries = options?.maxRetries ?? 5;
    this._migrationsPrefix = options.migrationsPrefix ?? this._migrationsPrefix;
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
        body: JSON.stringify(body),
        attempts: 0,
        timestamp: Date.now(),
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
            body: JSON.stringify(body),
            attempts: 0,
            timestamp: Date.now(),
          })),
        )
        .execute();
    }
  }

  async pullMessages(): Promise<QueueMessage[]> {
    const messages = await this._client
      .selectFrom("queue_messages")
      .selectAll()
      .where("dlq_at", "is", null)
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

  async retryMessage(id: string): Promise<void> {
    const message = await this._client
      .selectFrom("queue_messages")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();

    if (message) {
      if (message.attempts < this._maxRetries)
        await this._client
          .updateTable("queue_messages")
          .set({
            attempts: message.attempts + 1,
          })
          .where("id", "=", id)
          .execute();
    } else {
      await this._client
        .updateTable("queue_messages")
        .set({
          dlq_at: Date.now(),
        })
        .where("id", "=", id)
        .execute();
    }
  }

  public async runMigrations(down = false) {
    if (MIGRATIONS.length > 0) {
      const migrator = new Migrator({
        db: this._client,
        provider: new MigrationProvider(MIGRATIONS),
        migrationLockTableName: `${this._migrationsPrefix}_migrations_lock`,
        migrationTableName: `${this._migrationsPrefix}_migrations`,
      });

      if (!down) {
        return await migrator.migrateToLatest();
      } else {
        const allResults: MigrationResult[] = [];
        let error: unknown;

        try {
          let results;

          for (const _ of MIGRATIONS) {
            ({ results, error } = await migrator.migrateDown());

            allResults.push(...(results as MigrationResult[]));

            if (error) {
              break;
            }
          }
        } catch (_) {
          error = (_ as Error).message;
        }

        return { results: allResults, error };
      }
    }

    return { results: [] };
  }
}
