import { FilesAdapter } from "./files-adapter.js";

export class MemoryFilesAdapter extends FilesAdapter {
  private readonly _fileStore = new Map<string, ReadableStream>();
  private readonly _metadataStore = new Map<string, Record<string, string>>();

  async get(key: string) {
    return this._fileStore.get(key) ?? null;
  }

  async getMetadata(key: string) {
    return this._metadataStore.get(key) ?? null;
  }

  async put(
    key: string,
    stream: ReadableStream,
    metadata?: Record<string, string>,
  ) {
    this._fileStore.set(key, stream);
    this._metadataStore.set(key, metadata ?? {});
  }

  async delete(key: string) {
    this._fileStore.delete(key);
    this._metadataStore.delete(key);
  }
}
