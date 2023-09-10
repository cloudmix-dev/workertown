export class FilesAdapter {
  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  get(key: string): Promise<ReadableStream | null> {
    throw new Error("'getFile()' not implemented");
  }

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  getMetadata(key: string): Promise<Record<string, unknown> | null> {
    throw new Error("'getFileMetadata()' not implemented");
  }

  put(
    // biome-ignore lint/correctness/noUnusedVariables: Stub class
    key: string,
    // biome-ignore lint/correctness/noUnusedVariables: Stub class
    stream: ReadableStream | Uint8Array | Blob,
    // biome-ignore lint/correctness/noUnusedVariables: Stub class
    metadata?: Record<string, string>,
  ): Promise<void> {
    throw new Error("'putFile()' not implemented");
  }

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  delete(key: string): Promise<void> {
    throw new Error("'deleteFile()' not implemented");
  }

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  public async setup(down?: boolean): Promise<boolean> {
    return true;
  }
}
