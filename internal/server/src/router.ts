import { type Handler as HonoHandler, Hono } from "hono";

import { authenticated } from "./middleware/index.js";

export type Handler<
  E extends Record<string, unknown> = Record<string, unknown>,
> = HonoHandler<{
  Bindings: { [x: string]: unknown };
  Variables: E;
}>;

export type RouterHandler<
  E extends Record<string, unknown> = Record<string, unknown>,
> = Handler<E>;

export type MiddlewareHandler<
  E extends Record<string, unknown> = Record<string, unknown>,
> = Handler<E>;

export interface RouterOptions<E extends Record<string, unknown>> {
  public?: boolean;
  hono?: Hono<{
    Bindings: { [x: string]: unknown };
    Variables: E;
  }>;
}

export class Router<
  E extends Record<string, unknown> = Record<string, unknown>,
> {
  private readonly _router: Hono<{
    Bindings: { [x: string]: unknown };
    Variables: E;
  }>;

  private readonly _private: boolean;

  constructor(options: RouterOptions<E> = {}) {
    this._router = options.hono ?? new Hono();
    this._private = !options.public;

    this.use = this.use.bind(this);
    this.options = this.options.bind(this);
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
  }

  get router() {
    return this._router;
  }

  use(path: string, ...handlers: MiddlewareHandler<E>[]) {
    this._router.use(path, ...handlers);

    return this;
  }

  options(path: string, ...handlers: Handler<E>[]) {
    this._router.options(path, ...handlers);

    return this;
  }

  get(path: string, ...handlers: Handler<E>[]) {
    if (!this._private) {
      handlers.push(authenticated());
    }

    this._router.get(path, ...handlers);

    return this;
  }

  post(path: string, ...handlers: Handler<E>[]) {
    if (!this._private) {
      handlers.push(authenticated());
    }

    this._router.post(path, ...handlers);

    return this;
  }

  put(path: string, ...handlers: Handler<E>[]) {
    if (!this._private) {
      handlers.push(authenticated());
    }

    this._router.put(path, ...handlers);

    return this;
  }

  patch(path: string, ...handlers: Handler<E>[]) {
    if (!this._private) {
      handlers.push(authenticated());
    }

    this._router.patch(path, ...handlers);

    return this;
  }

  delete(path: string, ...handlers: Handler<E>[]) {
    if (!this._private) {
      handlers.push(authenticated());
    }

    this._router.delete(path, ...handlers);

    return this;
  }
}

export function createRouter<
  E extends Record<string, unknown> = Record<string, unknown>,
>(options?: RouterOptions<E>) {
  return new Router<E>(options);
}
