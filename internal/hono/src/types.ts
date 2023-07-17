import { type Env } from "hono";

export interface Context<T extends Env["Variables"] = {}> extends Env {
  Bindings: {
    [x: string]: any;
  } & Env["Bindings"];
  Variables: T & Env["Variables"];
}
