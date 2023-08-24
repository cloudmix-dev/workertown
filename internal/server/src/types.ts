import { type Env, type MiddlewareHandler } from "hono";

export interface Context<T extends Env["Variables"] = {}> extends Env {
  Bindings: {
    [x: string]: unknown;
  } & Env["Bindings"];
  Variables: T & Env["Variables"];
}

export type Middleware = MiddlewareHandler;

export type User = {
  id: string;
} & (
  | {
      strategy: "basic" | "api_key";
      claims: never;
    }
  | {
      strategy: "jwt";
      claims: {
        [x: string]: unknown;
      };
    }
);
