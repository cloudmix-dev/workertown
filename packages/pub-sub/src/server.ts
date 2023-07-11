import { type D1Database, Queue } from "@cloudflare/workers-types";
import { createServer } from "@workertown/hono";
import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { QueueAdapter } from "./queue";
import { CfQueuesQueueAdapter } from "./queue/cf-queues-queue-adapter";
import {
  adminRouter,
  publicRouter,
  publishRouter,
  subscriptionsRouter,
} from "./routers";
import { StorageAdapter } from "./storage";
import { D1StorageAdapter } from "./storage/d1-storage-adapter";
import { type ContextBindings, type CreateServerOptions } from "./types";

type CreateServerOptionsOptional = DeepPartial<CreateServerOptions>;

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
  basePath: "/",
  env: {
    database: "PUBSUB_DB",
    queue: "PUBSUB_QUEUE",
  },
  prefixes: {
    admin: "/v1/admin",
    public: "/",
    publish: "/v1/publish",
    subscriptions: "/v1/subscriptions",
  },
};

export function createPubSubServer(options?: CreateServerOptionsOptional) {
  const config = merge(DEFAULT_OPTIONS, options);
  const {
    auth: authOptions,
    basePath,
    prefixes,
    env: { database: dbEnvKey, queue: queueEnvKey },
    queue,
    storage,
  } = config;

  const server = createServer<ContextBindings>({ auth: authOptions, basePath });

  server.use(async (ctx, next) => {
    let storageAdapter: StorageAdapter | undefined = storage;
    let queueAdapter: QueueAdapter | undefined = queue;

    if (!storageAdapter) {
      const db = ctx.env[dbEnvKey] as D1Database | undefined;

      if (!db) {
        return ctx.json(
          {
            status: 500,
            success: false,
            data: null,
            error: `Database not found at env.${dbEnvKey}`,
          },
          500
        );
      }

      storageAdapter = new D1StorageAdapter({ db });
    }

    if (!queueAdapter) {
      const queue = ctx.env[queueEnvKey] as Queue<any> | undefined;

      if (!queue) {
        return ctx.json(
          {
            status: 500,
            success: false,
            data: null,
            error: `Queue not found at env.${queueEnvKey}`,
          },
          500
        );
      }

      queueAdapter = new CfQueuesQueueAdapter(queue);
    }

    ctx.set("config", config);
    ctx.set("storage", storageAdapter);
    ctx.set("queue", queueAdapter);

    return next();
  });

  server.route(prefixes.admin, adminRouter);
  server.route(prefixes.public, publicRouter);
  server.route(prefixes.publish, publishRouter);
  server.route(prefixes.subscriptions, subscriptionsRouter);

  return server;
}
