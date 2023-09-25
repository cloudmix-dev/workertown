import { type ServerOptionsOptional, createFilesServer } from "./server.js";
import { type UploadUrl } from "./storage/storage-adapter.js";
import { type RuntimeResolver } from "./types.js";

export default createFilesServer;
export {
  createFilesServer,
  createFilesServer as files,
  type ServerOptionsOptional as ServerOptions,
  type RuntimeResolver,
  type UploadUrl,
};
