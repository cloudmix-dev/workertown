export class RateLimiter {
  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  getRequestCount(ip: string): number | Promise<number> {
    throw new Error("'getRequestCount()' not implemented");
  }

  // biome-ignore lint/correctness/noUnusedVariables: Stub class
  storeRequest(ip: string): void | Promise<void> {
    throw new Error("'storeRequest()' not implemented");
  }
}
