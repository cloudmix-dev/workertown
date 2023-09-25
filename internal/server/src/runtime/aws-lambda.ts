import { handle } from "hono/aws-lambda";

import { type Server } from "../server.js";

// These interfaces are copy/paste from hono/aws-lambda because they are not
// exported...
interface ClientCert {
  clientCertPem: string;
  subjectDN: string;
  issuerDN: string;
  serialNumber: string;
  validity: {
    notBefore: string;
    notAfter: string;
  };
}

interface Identity {
  accessKey?: string;
  accountId?: string;
  caller?: string;
  cognitoAuthenticationProvider?: string;
  cognitoAuthenticationType?: string;
  cognitoIdentityId?: string;
  cognitoIdentityPoolId?: string;
  principalOrgId?: string;
  sourceIp: string;
  user?: string;
  userAgent: string;
  userArn?: string;
  clientCert?: ClientCert;
}

export interface ApiGatewayRequestContext {
  accountId: string;
  apiId: string;
  authorizer: {
    claims?: unknown;
    scopes?: unknown;
  };
  domainName: string;
  domainPrefix: string;
  extendedRequestId: string;
  httpMethod: string;
  identity: Identity;
  path: string;
  protocol: string;
  requestId: string;
  requestTime: string;
  requestTimeEpoch: number;
  resourceId?: string;
  resourcePath: string;
  stage: string;
}

export interface APIGatewayProxyEventV2 {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  rawPath: string;
  rawQueryString: string;
  body: string | null;
  isBase64Encoded: boolean;
  requestContext: ApiGatewayRequestContext;
}

export interface APIGatewayProxyEvent {
  httpMethod: string;
  headers: Record<string, string | undefined>;
  path: string;
  body: string | null;
  isBase64Encoded: boolean;
  queryStringParameters?: Record<string, string | undefined>;
  requestContext: ApiGatewayRequestContext;
}

interface Authorizer {
  iam?: {
    accessKey: string;
    accountId: string;
    callerId: string;
    cognitoIdentity: null;
    principalOrgId: null;
    userArn: string;
    userId: string;
  };
}

export interface LambdaFunctionUrlRequestContext {
  accountId: string;
  apiId: string;
  authentication: null;
  authorizer: Authorizer;
  domainName: string;
  domainPrefix: string;
  http: {
    method: string;
    path: string;
    protocol: string;
    sourceIp: string;
    userAgent: string;
  };
  requestId: string;
  routeKey: string;
  stage: string;
  time: string;
  timeEpoch: number;
}

export interface LambdaFunctionUrlEvent {
  headers: Record<string, string | undefined>;
  rawPath: string;
  rawQueryString: string;
  body: string | null;
  isBase64Encoded: boolean;
  requestContext: LambdaFunctionUrlRequestContext;
}

export interface APIGatewayProxyResult {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
  isBase64Encoded: boolean;
}

export function serve(
  // biome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the Server here, and the return type is broken
  server: Server<any>,
): (
  event: APIGatewayProxyEventV2 | APIGatewayProxyEvent | LambdaFunctionUrlEvent,
) => Promise<APIGatewayProxyResult> {
  return handle(server.server);
}
