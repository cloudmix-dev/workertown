import { authenticated } from "@workertown/middleware";
import { Hono, type Env as HonoEnv } from "hono";

interface CreateRouterOptions {
  public: boolean;
}

export function createRouter<T extends HonoEnv>(options?: CreateRouterOptions) {
  const router = new Hono<T>();

  if (!options?.public) {
    router.use("*", authenticated());
  }

  return router;
}
