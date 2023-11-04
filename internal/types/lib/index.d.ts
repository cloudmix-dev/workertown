// Make all (inc. nested) properties in T optional
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// Copied from: https://raw.githubusercontent.com/denoland/deno/v1.37.0/cli/tsc/dts/lib.deno.unstable.d.ts

export type KvKeyPart = Uint8Array | string | number | bigint | boolean;

export type KvKey = readonly KvKeyPart[];

export type KvConsistencyLevel = "strong" | "eventual";

export type KvListSelector =
  | { prefix: KvKey }
  | { prefix: KvKey; start: KvKey }
  | { prefix: KvKey; end: KvKey }
  | { start: KvKey; end: KvKey };

export class KvU64 {
  constructor(value: bigint);
  readonly value: bigint;
}

export type KvMutation = { key: KvKey } & (
  | { type: "set"; value: unknown; expireIn?: number }
  | { type: "delete" }
  | { type: "sum"; value: KvU64 }
  | { type: "max"; value: KvU64 }
  | { type: "min"; value: KvU64 }
);

export class KvListIterator<T> implements AsyncIterableIterator<KvEntry<T>> {
  get cursor(): string;
  next(): Promise<IteratorResult<KvEntry<T>, undefined>>;
  [Symbol.asyncIterator](): AsyncIterableIterator<KvEntry<T>>;
}

export type KvEntry<T> = { key: KvKey; value: T; versionstamp: string };

export type KvEntryMaybe<T> =
  | KvEntry<T>
  | {
      key: KvKey;
      value: null;
      versionstamp: null;
    };

export interface KvListOptions {
  limit?: number;
  cursor?: string;
  reverse?: boolean;
  consistency?: KvConsistencyLevel;
  batchSize?: number;
}

export interface KvCommitResult {
  ok: true;
  versionstamp: string;
}

export interface KvCommitError {
  ok: false;
}

export interface AtomicCheck {
  key: KvKey;
  versionstamp: string | null;
}

export class AtomicOperation {
  check(...checks: AtomicCheck[]): this;
  mutate(...mutations: KvMutation[]): this;
  sum(key: KvKey, n: bigint): this;
  min(key: KvKey, n: bigint): this;
  max(key: KvKey, n: bigint): this;
  set(key: KvKey, value: unknown, options?: { expireIn?: number }): this;
  delete(key: KvKey): this;
  enqueue(
    value: unknown,
    options?: { delay?: number; keysIfUndelivered?: KvKey[] },
  ): this;
  commit(): Promise<KvCommitResult | KvCommitError>;
}

export class DenoKv {
  get<T = unknown>(
    key: KvKey,
    options?: { consistency?: KvConsistencyLevel },
  ): Promise<KvEntryMaybe<T>>;
  // biome-ignore lint/suspicious/noRedeclare: Deno generated types
  getMany<T extends readonly unknown[]>(
    keys: readonly [...{ [K in keyof T]: KvKey }],
    options?: { consistency?: KvConsistencyLevel },
    // biome-ignore lint/suspicious/noRedeclare: Deno generated types
  ): Promise<{ [K in keyof T]: KvEntryMaybe<T[K]> }>;
  set(
    key: KvKey,
    value: unknown,
    options?: { expireIn?: number },
  ): Promise<KvCommitResult>;
  delete(key: KvKey): Promise<void>;
  // biome-ignore lint/suspicious/noRedeclare: Deno generated types
  list<T = unknown>(
    selector: KvListSelector,
    options?: KvListOptions,
  ): KvListIterator<T>;
  enqueue(
    value: unknown,
    options?: { delay?: number; keysIfUndelivered?: KvKey[] },
  ): Promise<KvCommitResult>;
  // biome-ignore lint/suspicious/noConfusingVoidType: Deno generated types
  listenQueue(handler: (value: unknown) => Promise<void> | void): Promise<void>;
  atomic(): AtomicOperation;
  close(): void;
}

export interface Deno {
  openKv(path?: string): Promise<DenoKv>;
}
