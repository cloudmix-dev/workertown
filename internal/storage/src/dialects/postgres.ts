import { Kysely, PostgresDialect as KyselyPostgresDialect } from "kysely";
import pg from "pg";

import { Dialect } from "./dialect.js";

export interface PostgresDialectOptions {
  database: string;
  host: string;
  port?: number;
  password: string;
  user: string;
}

export class PostgresDialect<T> extends Dialect<T> {
  constructor(options: PostgresDialectOptions) {
    const pool = new pg.Pool(options);
    const client = new Kysely<T>({
      dialect: new KyselyPostgresDialect({ pool }),
    });

    super({ client });
  }
}
