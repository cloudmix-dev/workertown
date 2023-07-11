import {
  type InfoRoute,
  type RunMigrationsRoute,
  router as adminRouter,
} from "./admin";
import {
  type HealthRoute,
  type OpenApiRoute,
  router as publicRouter,
} from "./public";
import { type PublishRoute, router as publishRouter } from "./publish";
import {
  type CreateSubscriptionRoute,
  type DeleteSubscriptionRoute,
  type GetSubscriptionsRoute,
  router as subscriptionsRouter,
} from "./subscriptions";

export {
  adminRouter,
  publicRouter,
  publishRouter,
  subscriptionsRouter,
  type CreateSubscriptionRoute,
  type DeleteSubscriptionRoute,
  type GetSubscriptionsRoute,
  type HealthRoute,
  type InfoRoute,
  type OpenApiRoute,
  type PublishRoute,
  type RunMigrationsRoute,
};
