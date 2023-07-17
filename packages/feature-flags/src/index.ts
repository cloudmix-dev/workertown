import {
  type CreateServerOptionsOptional,
  createFeatureFlagsServer,
} from "./server.js";

export default createFeatureFlagsServer;
export {
  createFeatureFlagsServer,
  createFeatureFlagsServer as featureFlags,
  type CreateServerOptionsOptional as CreateServerOptions,
};
