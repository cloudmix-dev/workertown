import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";

import { StorageAdapter } from "./storage-adapter.js";

interface SqliteStorageAdapterOptions {
  db: string;
}

export class SqliteStorageAdapter<T = {}> extends StorageAdapter {
  protected readonly _client: Kysely<T>;

  constructor(options?: SqliteStorageAdapterOptions) {
    super();

    const db = new Database(options?.db ?? "db.sqlite");

    if (globalThis.process) {
      process.on("exit", () => db.close());
    }

    this._client = new Kysely<T>({
      dialect: new SqliteDialect({
        database: db,
      }),
    });
  }
}
