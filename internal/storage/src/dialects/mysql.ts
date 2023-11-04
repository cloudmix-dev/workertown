import { Kysely, MysqlDialect as KyselyMysqlDialect } from "kysely";
import { createPool } from "mysql2";

import { Dialect } from "./dialect.js";

export interface MysqlDialectOptions {
  database: string;
  host: string;
}

export class MysqlDialect<T> extends Dialect<T> {
  constructor(options: MysqlDialectOptions) {
    const pool = createPool(options);
    const client = new Kysely<T>({
      dialect: new KyselyMysqlDialect({ pool }),
    });

    super({ client });
  }
}
