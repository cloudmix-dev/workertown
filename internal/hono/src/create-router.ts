import { Hono } from "hono";

import { type WorkertownHono } from "./create-server.js";
import { authenticated } from "./middleware/index.js";
import { type Context } from "./types.js";

interface CreateRouterOptions {
  public: boolean;
}

export function createRouter<T extends Context>(options?: CreateRouterOptions) {
  const router = new Hono<T>() as WorkertownHono<T>;

  if (!options?.public) {
    router.use("*", authenticated());
  }

  return router;
}
