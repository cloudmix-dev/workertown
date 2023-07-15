import { KVNamespace } from "@cloudflare/workers-types";

import { StorageAdapter } from "./storage-adapter.js";

interface KVAdapterOptions {
  kv: KVNamespace;
}

export class KVStorageAdapter extends StorageAdapter {
  private readonly _kv: KVNamespace;

  constructor(options: KVAdapterOptions) {
    super();

    this._kv = options.kv;
  }

  private _formatKey(key: string) {
    return key.replaceAll(/\//g, "_");
  }

  async getValue<T = any>(key: string) {
    const value = await this._kv.get<T>(this._formatKey(key), "json");

    return value;
  }

  async setValue<T = any>(key: string, value: T) {
    await this._kv.put(this._formatKey(key), JSON.stringify(value));

    return value;
  }

  async deleteValue(key: string) {
    await this._kv.delete(this._formatKey(key));
  }

  async runMigrations() {}
}
