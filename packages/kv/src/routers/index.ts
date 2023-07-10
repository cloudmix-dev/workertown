import {
  type InfoRoute,
  type RunMigrationsRoute,
  router as adminRouter,
} from "./admin";
import {
  type DeleteKvRoute,
  type GetKvRoute,
  type SetKvRoute,
  router as kvRouter,
} from "./kv";
import {
  type HealthRoute,
  type OpenApiRoute,
  router as publicRouter,
} from "./public";

export {
  adminRouter,
  kvRouter,
  publicRouter,
  type DeleteKvRoute,
  type GetKvRoute,
  type HealthRoute,
  type InfoRoute,
  type OpenApiRoute,
  type RunMigrationsRoute,
  type SetKvRoute,
};
