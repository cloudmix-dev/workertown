/**
 * This file is heavily inspired by: https://github.com/honojs/hono/blob/main/src/middleware/logger/index.ts
 */
import { type MiddlewareHandler } from "hono";

export type LoggerFunc = (
  method: string,
  path: string,
  status: number,
  elapsed: string,
) => void | Promise<void>;

function time(start: number) {
  const delta = Date.now() - start;

  return delta < 1e3 ? `${delta}ms` : `${Math.round(delta / 1e3)}s`;
}

function colorStatus(status: number) {
  const out: { [x: number]: string } = {
    7: `\x1B[35m${status}\x1B[0m`,
    5: `\x1B[31m${status}\x1B[0m`,
    4: `\x1B[33m${status}\x1B[0m`,
    3: `\x1B[36m${status}\x1B[0m`,
    2: `\x1B[32m${status}\x1B[0m`,
    1: `\x1B[32m${status}\x1B[0m`,
    0: `\x1B[33m${status}\x1B[0m`,
  };
  const calculateStatus = (status / 100) | 0;

  return out[calculateStatus];
}

const defaultLogger: LoggerFunc = (
  method: string,
  path: string,
  status: number,
  elapsed: string,
) => {
  const out = `${method} ${path} ${colorStatus(status)} ${elapsed}`;

  console.log(out);
};

export function logger(func: LoggerFunc = defaultLogger) {
  const handler: MiddlewareHandler = async (ctx, next) => {
    const url = new URL(ctx.req.url);
    const start = Date.now();

    await next();
    await func(ctx.req.method, url.pathname, ctx.res.status, time(start));
  };

  return handler;
}
