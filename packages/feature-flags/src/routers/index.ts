import {
  type InfoRoute,
  type RunMigrationsRoute,
  router as adminRouter,
} from "./admin";
import { type AskRoute, router as askRouter } from "./ask";
import {
  type DeleteFlagRoute,
  type GetFlagRoute,
  type GetFlagsRoute,
  type UpsertFlagRoute,
  router as flagsRouter,
} from "./flags";
import {
  type HealthRoute,
  type OpenApiRoute,
  router as publicRouter,
} from "./public";

export {
  adminRouter,
  askRouter,
  flagsRouter,
  publicRouter,
  type AskRoute,
  type DeleteFlagRoute,
  type GetFlagRoute,
  type GetFlagsRoute,
  type HealthRoute,
  type InfoRoute,
  type OpenApiRoute,
  type RunMigrationsRoute,
  type UpsertFlagRoute,
};
