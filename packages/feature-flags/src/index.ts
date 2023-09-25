import {
  type ServerOptionsOptional,
  createFeatureFlagsServer,
} from "./server.js";
import { type Flag, type FlagCondition } from "./storage/storage-adapter.js";
import { type RuntimeResolver } from "./types.js";

export default createFeatureFlagsServer;
export {
  createFeatureFlagsServer,
  createFeatureFlagsServer as featureFlags,
  type ServerOptionsOptional as ServerOptions,
  type Flag,
  type FlagCondition,
  type RuntimeResolver,
};
