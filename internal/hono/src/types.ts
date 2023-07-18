import { type Env } from "hono";

export interface Context<T extends Env["Variables"] = {}> extends Env {
  Bindings: {
    [x: string]: unknown;
  } & Env["Bindings"];
  Variables: T & Env["Variables"];
}
