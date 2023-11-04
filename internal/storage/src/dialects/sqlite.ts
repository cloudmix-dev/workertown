import Database from "better-sqlite3";
import { Kysely, SqliteDialect as KyselySqliteDialect } from "kysely";

import { Dialect } from "./dialect.js";

export interface SqliteDialectOptions {
  db?: string;
}

export class SqliteDialect<T> extends Dialect<T> {
  constructor(options: SqliteDialectOptions) {
    const db = new Database(options?.db ?? "db.sqlite");
    const client = new Kysely<T>({
      dialect: new KyselySqliteDialect({
        database: db,
      }),
    });

    super({ client });
  }
}
