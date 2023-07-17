import {
  type CreateServerOptionsOptional,
  createPubSubServer,
} from "./server.js";

export default createPubSubServer;
export {
  createPubSubServer,
  createPubSubServer as pubSub,
  type CreateServerOptionsOptional as CreateServerOptions,
};
