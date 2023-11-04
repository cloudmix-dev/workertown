import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Kysely } from "kysely";

import { Dialect } from "./dialect.js";

export interface TursoDialectOptions {
  url?: string;
  authToken?: string;
  migrationsPrefix?: string;
}

export class TursoDialect<T> extends Dialect<T> {
  constructor(options: TursoDialectOptions) {
    const client = new Kysely<T>({
      dialect: new LibsqlDialect(options),
    });

    super({ client });
  }
}
