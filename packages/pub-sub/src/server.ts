import { type Server, createServer } from "@workertown/internal-server";
import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { QueueAdapter, type QueueMessage } from "./queue/index.js";
import { publicRouter, v1 } from "./routers/index.js";
import { runtime as cloudflareWorkersRuntime } from "./runtime/cloudflare-workers.js";
import { StorageAdapter } from "./storage/index.js";
import { type Context, type CreateServerOptions } from "./types.js";

export type CreateServerOptionsOptional = DeepPartial<CreateServerOptions>;

const DEFAULT_OPTIONS: CreateServerOptions = {
  auth: {
    apiKey: {
      env: {
        apiKey: "PUBSUB_API_KEY",
      },
    },
    basic: {
      env: {
        username: "PUBSUB_USERNAME",
        password: "PUBSUB_PASSWORD",
      },
    },
    jwt: {
      env: {
        jwksUrl: "PUBSUB_JWKS_URL",
        secret: "PUBSUB_JWT_SECRET",
        audience: "PUBSUB_JWT_AUDIENCE",
        issuer: "PUBSUB_JWT_ISSUER",
      },
    },
  },
  endpoints: {
    v1: {
      admin: "/v1/admin",
      publish: "/v1/publish",
      subscriptions: "/v1/subscriptions",
    },
    public: "/",
  },
  env: {
    db: "PUBSUB_DB",
    queue: "PUBSUB_QUEUE",
  },
};

export function createPubSubServer(
  options?: CreateServerOptionsOptional,
): Server<Context> {
  const config = merge({}, DEFAULT_OPTIONS, options);
  const {
    endpoints,
    runtime = cloudflareWorkersRuntime,
    ...baseConfig
  } = config;

  const server = createServer<Context>(baseConfig);
  let storage: StorageAdapter;
  let queue: QueueAdapter;

  server.use(async (ctx, next) => {
    if (!storage && !queue) {
      ({ storage, queue } =
        typeof runtime === "function"
          ? runtime(config, ctx.env)
          : runtime ?? cloudflareWorkersRuntime(config, ctx.env));
    }

    ctx.set("config", config);
    ctx.set("storage", storage);
    ctx.set("queue", queue);

    return next();
  });

  server.route(endpoints.v1.admin, v1.adminRouter);
  server.route(endpoints.v1.publish, v1.publishRouter);
  server.route(endpoints.v1.subscriptions, v1.subscriptionsRouter);

  server.route(endpoints.public, publicRouter);

  server.queue = async (batch) => {
    const results = await Promise.allSettled(
      batch.messages.map(async (message) => {
        const { endpoint, headers, method, queryParameters, body } = (
          message.body as QueueMessage
        ).body;
        const url = new URL(endpoint);
        const reqHeaders = new Headers({
          "content-type": "application/json",
        });

        if (headers) {
          for (const [key, value] of Object.entries(headers)) {
            reqHeaders.set(key, value);
          }
        }

        if (queryParameters) {
          for (const [key, value] of Object.entries(queryParameters)) {
            url.searchParams.set(key, value);
          }
        }

        const res = await fetch(url.toString(), {
          method,
          headers: reqHeaders,
          body:
            method !== "GET" && method !== "DELETE" && body
              ? JSON.stringify(body)
              : undefined,
        });

        if (!res.ok) {
          throw new Error();
        }
      }),
    );

    for (const [index, result] of results.entries()) {
      const message = batch.messages[index];

      if (result.status === "rejected") {
        message?.retry();
      } else {
        message?.ack();
      }
    }
  };

  return server;
}
