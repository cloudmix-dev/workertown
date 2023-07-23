import {
  type Callback,
  type CloudFrontEdgeEvent,
  type CloudFrontResponse,
  type CloudFrontResult,
  serve as awsLambdaEdgeServe,
} from "./aws-lambda-edge.js";
import {
  type APIGatewayProxyEvent,
  type APIGatewayProxyEventV2,
  type APIGatewayProxyResult,
  type LambdaFunctionUrlEvent,
  serve as awsLambdaServe,
} from "./aws-lambda.js";
import { serve as cloudflarePagesServe } from "./cloudflare-pages.js";
import { serve as vercelServe } from "./vercel.js";

export {
  awsLambdaEdgeServe,
  awsLambdaServe,
  cloudflarePagesServe,
  vercelServe,
  type APIGatewayProxyEvent,
  type APIGatewayProxyEventV2,
  type APIGatewayProxyResult,
  type Callback,
  type CloudFrontEdgeEvent,
  type CloudFrontResponse,
  type CloudFrontResult,
  type LambdaFunctionUrlEvent,
};
