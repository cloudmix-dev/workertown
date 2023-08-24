import {
  type Callback,
  type CloudFrontEdgeEvent,
  handle,
} from "hono/lambda-edge";

import { type Server } from "../server.js";

interface CloudFrontHeader {
  key: string;
  value: string;
}

interface CloudFrontHeaders {
  [name: string]: CloudFrontHeader[];
}

export interface CloudFrontResponse {
  headers: CloudFrontHeaders;
  status: string;
  statusDescription?: string;
}

declare type CloudFrontContext = {};

export interface CloudFrontResult {
  status: string;
  statusDescription?: string;
  headers?: {
    [header: string]: {
      key: string;
      value: string;
    }[];
  };
  body?: string;
  bodyEncoding?: "text" | "base64";
}

export { type Callback, type CloudFrontEdgeEvent };

export function serve(
  // rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the the Server here, and the return type is broken
  server: Server<any>,
): (
  event: CloudFrontEdgeEvent,
  context?: CloudFrontContext,
  callback?: Callback,
) => Promise<CloudFrontResult> {
  return handle(server);
}
