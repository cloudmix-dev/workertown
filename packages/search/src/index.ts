import {
  type CreateServerOptionsOptional,
  createSearchServer,
} from "./server.js";

export default createSearchServer;
export {
  createSearchServer,
  createSearchServer as search,
  type CreateServerOptionsOptional as CreateServerOptions,
};
