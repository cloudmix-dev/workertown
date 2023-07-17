import { Kysely } from "kysely";
import { PlanetScaleDialect } from "kysely-planetscale";

import { StorageAdapter } from "./storage-adapter.js";

interface PlanetscaleStorageAdapterOptions {
  url?: string;
  username?: string;
  password?: string;
}

export class PlanetscaleStorageAdapter<T = {}> extends StorageAdapter {
  protected readonly _client: Kysely<T>;

  constructor(options: PlanetscaleStorageAdapterOptions = {}) {
    super();

    this._client = new Kysely<T>({
      dialect: new PlanetScaleDialect(options),
    });
  }
}
