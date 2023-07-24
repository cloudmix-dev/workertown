import {
  QueueAdapter,
  type QueueMessage as BaseQueueMessage,
  createQueueProcessor,
} from "@workertown/internal-queue";

export type QueueMessage = BaseQueueMessage<{
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  topic: string;
  endpoint: string;
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
  body?: Record<string, unknown>;
}>;

export { createQueueProcessor, QueueAdapter };
