import { handle } from "hono/aws-lambda";

import { type WorkertownHono } from "../create-server.js";

// These interfaces are copy/paste from hono/aws-lambda because they are not
// exported...
export interface APIGatewayProxyEventV2 {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  rawPath: string;
  rawQueryString: string;
  body: string | null;
  isBase64Encoded: boolean;
  requestContext: {
    domainName: string;
  };
}

export interface APIGatewayProxyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  path: string;
  body: string | null;
  isBase64Encoded: boolean;
  queryStringParameters?: Record<string, string | undefined>;
  requestContext: {
    domainName: string;
  };
}

export interface LambdaFunctionUrlEvent {
  headers: Record<string, string | undefined>;
  rawPath: string;
  rawQueryString: string;
  body: string | null;
  isBase64Encoded: boolean;
  requestContext: {
    domainName: string;
    http: {
      method: string;
    };
  };
}

export interface APIGatewayProxyResult {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
  isBase64Encoded: boolean;
}

export function serve(
  // rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the the WorkertownHono server here, and the return type is broken
  server: WorkertownHono<any>,
): (
  event: APIGatewayProxyEvent | APIGatewayProxyEventV2 | LambdaFunctionUrlEvent,
) => Promise<APIGatewayProxyResult> {
  return handle(server);
}
