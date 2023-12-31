import { KVNamespace } from "@cloudflare/workers-types";

import { StorageAdapter } from "./storage-adapter.js";

interface KVStorageAdapterOptions {
  kv: KVNamespace;
}

export class KVStorageAdapter extends StorageAdapter {
  private readonly _kv: KVNamespace;

  constructor(options: KVStorageAdapterOptions) {
    super();

    this._kv = options.kv;
  }

  private _formatKey(key: string) {
    return `kv_${key.replaceAll(/\//g, "_")}`;
  }

  public async getValue<T = unknown>(key: string) {
    const value = await this._kv.get<T>(this._formatKey(key), "json");

    return value;
  }

  public async setValue<T = unknown>(key: string, value: T) {
    await this._kv.put(this._formatKey(key), JSON.stringify(value));

    return value;
  }

  public async deleteValue(key: string) {
    await this._kv.delete(this._formatKey(key));
  }
}
