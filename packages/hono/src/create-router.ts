import { authenticated } from "@workertown/middleware";
import { Hono } from "hono";

import { type WorkertownHono } from "./create-server";
import { type Context } from "./types";

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
