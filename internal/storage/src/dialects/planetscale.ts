import { Kysely } from "kysely";
import { PlanetScaleDialect as KyselyPlanetScaleDialect } from "kysely-planetscale";

import { Dialect } from "./dialect.js";

export interface PlanetscaleDialectOptions {
  url?: string;
  host?: string;
  username?: string;
  password?: string;
  migrationsPrefix?: string;
}

export class PlanetscaleDialect<T> extends Dialect<T> {
  constructor(options: PlanetscaleDialectOptions) {
    const client = new Kysely<T>({
      dialect: new KyselyPlanetScaleDialect(options),
    });

    super({ client });
  }
}
