import {
  type GetMigrationsRoute,
  type InfoRoute,
  type RunMigrationsRoute,
  router as adminRouter,
} from "./admin";
import {
  type DeleteItemRoute,
  type GetItemRoute,
  type IndexItemRoute,
  router as itemsRouter,
} from "./items";
import { type OpenApiRoute, router as publicRouter } from "./public";
import { type SearchRoute, router as searchRouter } from "./search";
import { type SuggestRoute, router as suggestRouter } from "./suggest";
import { type GetTagsRoute, router as tagsRouter } from "./tags";

export {
  adminRouter,
  itemsRouter,
  publicRouter,
  searchRouter,
  suggestRouter,
  tagsRouter,
  type DeleteItemRoute,
  type GetItemRoute,
  type GetMigrationsRoute,
  type GetTagsRoute,
  type IndexItemRoute,
  type InfoRoute,
  type OpenApiRoute,
  type RunMigrationsRoute,
  type SearchRoute,
  type SuggestRoute,
};
