export class FilesAdapter {
  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  get(key: string): Promise<ReadableStream | null> {
    throw new Error("'getFile()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  getMetadata(key: string): Promise<Record<string, unknown> | null> {
    throw new Error("'getFileMetadata()' not implemented");
  }

  put(
    // rome-ignore lint/correctness/noUnusedVariables: Stub class
    key: string,
    // rome-ignore lint/correctness/noUnusedVariables: Stub class
    stream: ReadableStream | Uint8Array | Blob,
    // rome-ignore lint/correctness/noUnusedVariables: Stub class
    metadata?: Record<string, string>,
  ): Promise<void> {
    throw new Error("'putFile()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  delete(key: string): Promise<void> {
    throw new Error("'deleteFile()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  public async setup(down?: boolean): Promise<boolean> {
    return true;
  }
}
