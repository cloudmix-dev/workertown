import {
  type CreateServerOptionsOptional,
  createPubSubServer,
} from "./server.js";
import { type RuntimeResolver } from "./types.js";

export default createPubSubServer;
export {
  createPubSubServer,
  createPubSubServer as pubSub,
  type CreateServerOptionsOptional as CreateServerOptions,
  type RuntimeResolver,
};
