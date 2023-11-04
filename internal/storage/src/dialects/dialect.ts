import { type Kysely } from "kysely";

export interface DialectOptions<T> {
  client: Kysely<T>;
}

export class Dialect<T> {
  readonly #client: Kysely<T>;

  constructor(options: DialectOptions<T>) {
    this.#client = options.client;
  }

  get client() {
    return this.#client;
  }
}
