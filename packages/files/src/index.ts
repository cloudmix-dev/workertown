import {
  type CreateServerOptionsOptional,
  createFilesServer,
} from "./server.js";
import { type UploadUrl } from "./storage/storage-adapter.js";
import { type RuntimeResolver } from "./types.js";

export default createFilesServer;
export {
  createFilesServer,
  createFilesServer as files,
  type CreateServerOptionsOptional as CreateServerOptions,
  type RuntimeResolver,
  type UploadUrl,
};
