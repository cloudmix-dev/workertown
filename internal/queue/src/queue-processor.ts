import { type Message, type MessageBatch } from "@cloudflare/workers-types";

import { QueueAdapter, type QueueMessage } from "./queue-adapter.js";

interface CreateQueueProcessorOptions {
  adapter: QueueAdapter;
  // rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the WorkertownHono server
  server: any;
  delay?: number;
  schedule?: (callback: () => Promise<void>, delay: number) => Promise<void>;
}

class QueueProcessor {
  private readonly _queue: QueueAdapter;

  // rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the WorkertownHono server
  private readonly _server: any;

  private readonly _delay: number;

  private readonly _schedule: (
    callback: () => Promise<void>,
    delay: number,
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

  private _wrapMessage(message: QueueMessage): Message<QueueMessage> {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      body: message,
      ack: () => this._queue.ackMessage?.(message.id),
      retry: () => this._queue.retryMessage?.(message.id),
    };
  }

  private async _processQueue() {
    const messages = await this._queue.pullMessages();
    let delay = this._delay;

    if (messages.length > 0) {
      const batch: MessageBatch<QueueMessage> = {
        messages: messages.map((message) => this._wrapMessage(message)),
        queue: "default",
        ackAll: () => {
          Promise.allSettled(
            messages.map((message) => this._queue.ackMessage?.(message.id)),
          );
        },
        retryAll: () => {
          Promise.allSettled(
            messages.map((message) => this._queue.retryMessage?.(message.id)),
          );
        },
      };

      await this._server.queue(batch, {}, {});

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
