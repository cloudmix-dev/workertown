import {
  type CreateServerOptionsOptional,
  createSearchServer,
} from "./server.js";
import { type SearchDocument } from "./storage/storage-adapter.js";
import { type RuntimeResolver } from "./types.js";

export default createSearchServer;
export {
  createSearchServer,
  createSearchServer as search,
  type CreateServerOptionsOptional as CreateServerOptions,
  type RuntimeResolver,
  type SearchDocument,
};
