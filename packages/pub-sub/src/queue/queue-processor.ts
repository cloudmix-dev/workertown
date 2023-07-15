import { type Message, type MessageBatch } from "@cloudflare/workers-types";
import { WorkertownHono } from "@workertown/hono";

import { type Context } from "../types.js";
import { QueueAdapter, type QueueMessage } from "./queue-adapter.js";

interface CreateQueueProcessorOptions {
  adapter: QueueAdapter;
  server: WorkertownHono<Context>;
}

class QueueProcessor {
  private _queue: QueueAdapter;

  private _server: WorkertownHono<Context>;

  constructor(options: CreateQueueProcessorOptions) {
    this._queue = options.adapter;
    this._server = options.server;
  }

  private _wrapMessage(message: QueueMessage): Message {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      body: message,
      ack: () => this._queue.ackMessage?.(message.id),
      retry: () => this._queue.rescheduleMessage?.(message.id),
    };
  }

  async process() {
    const messages = await this._queue.pullMessages();

    if (messages.length > 0) {
      const batch: MessageBatch = {
        messages: messages.map((message) => this._wrapMessage(message)),
        queue: "main",
        ackAll: () => {
          messages.forEach((message) => this._queue.ackMessage?.(message.id));
        },
        retryAll: () => {
          messages.forEach((message) =>
            this._queue.rescheduleMessage?.(message.id)
          );
        },
      };

      await this._server.queue?.(batch, {} as any, {} as any);
    }
  }
}

export function createQueueProcessor(options: CreateQueueProcessorOptions) {
  return new QueueProcessor(options);
}
