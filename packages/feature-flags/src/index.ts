import {
  type CreateServerOptionsOptional,
  createFeatureFlagsServer,
} from "./server.js";
import { type RuntimeResolver } from "./types.js";

export default createFeatureFlagsServer;
export {
  createFeatureFlagsServer,
  createFeatureFlagsServer as featureFlags,
  type CreateServerOptionsOptional as CreateServerOptions,
  type RuntimeResolver,
};
