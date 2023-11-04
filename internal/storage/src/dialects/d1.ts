import { D1Database } from "@cloudflare/workers-types";
import { type Dialect as KyselyDialect, Kysely } from "kysely";
import { D1Dialect as KyselyD1Dialect } from "kysely-d1";

import { Dialect } from "./dialect.js";

export interface D1DialectOptions {
  d1: D1Database;
  migrationsPrefix?: string;
}

export class D1Dialect<T> extends Dialect<T> {
  constructor(options: D1DialectOptions) {
    const client = new Kysely<T>({
      // The `as unknown as Dialect` is a workaround for a bug in the kysely-d1
      // types
      dialect: new KyselyD1Dialect({
        database: options.d1,
      }) as unknown as KyselyDialect,
    });

    super({ client });
  }
}
