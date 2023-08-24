import { Hono } from "hono";

import { authenticated } from "./middleware/index.js";
import { type Router } from "./router.js";
import { type Context } from "./types.js";

interface CreateRouterOptions {
  public: boolean;
}

export function createRouter<T extends Context>(options?: CreateRouterOptions) {
  const router = new Hono<T>() as Router<T>;

  if (!options?.public) {
    router.use("*", authenticated());
  }

  return router;
}
