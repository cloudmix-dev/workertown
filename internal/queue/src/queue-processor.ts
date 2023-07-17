import { type Message, type MessageBatch } from "@cloudflare/workers-types";
import { WorkertownHono } from "@workertown/internal-hono";

import { QueueAdapter, type QueueMessage } from "./queue-adapter.js";

interface CreateQueueProcessorOptions {
  adapter: QueueAdapter;
  server: WorkertownHono<any>;
  delay?: number;
  schedule?: (callback: () => Promise<void>, delay: number) => Promise<void>;
}

class QueueProcessor {
  private _queue: QueueAdapter;

  private _server: WorkertownHono<any>;

  private _delay: number;

  private _schedule: (
    callback: () => Promise<void>,
    delay: number
  ) => Promise<void>;

  constructor(options: CreateQueueProcessorOptions) {
    this._queue = options.adapter;
    this._server = options.server;
    this._delay = options.delay ?? 1000;
    this._schedule =
      options.schedule ??
      (async (callback, delay) => {
        setTimeout(callback, delay);
      });
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

  private async _processQueue() {
    const messages = await this._queue.pullMessages();
    let delay = this._delay;

    if (messages.length > 0) {
      const batch: MessageBatch = {
        messages: messages.map((message) => this._wrapMessage(message)),
        queue: "main",
        ackAll: () => {
          Promise.allSettled(
            messages.map((message) => this._queue.ackMessage?.(message.id))
          );
        },
        retryAll: () => {
          Promise.allSettled(
            messages.map((message) =>
              this._queue.rescheduleMessage?.(message.id)
            )
          );
        },
      };

      await this._server.queue?.(batch, {} as any, {} as any);

      delay = 0;
    }

    this._schedule(() => this._processQueue(), delay);
  }

  async start() {
    return this._processQueue();
  }
}

export function createQueueProcessor(options: CreateQueueProcessorOptions) {
  return new QueueProcessor(options);
}
