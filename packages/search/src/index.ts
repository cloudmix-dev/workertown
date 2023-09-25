import { type ServerOptionsOptional, createSearchServer } from "./server.js";
import { type SearchDocument } from "./storage/storage-adapter.js";
import { type RuntimeResolver } from "./types.js";

export default createSearchServer;
export {
  createSearchServer,
  createSearchServer as search,
  type ServerOptionsOptional as ServerOptions,
  type RuntimeResolver,
  type SearchDocument,
};
