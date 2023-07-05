import {
  type GetMigrationsRoute,
  type InfoRoute,
  type RunMigrationsRoute,
  router as adminRouter,
} from "./admin";
import { type OpenApiRoute, router as publicRouter } from "./public";

export {
  adminRouter,
  publicRouter,
  type GetMigrationsRoute,
  type InfoRoute,
  type OpenApiRoute,
  type RunMigrationsRoute,
};
