import { type Queue } from "@cloudflare/workers-types";

import { QueueAdapter, type QueueMessage } from "./queue-adapter.js";

export class CfQueuesQueueAdapter extends QueueAdapter {
  private _queue: Queue<QueueMessage>;

  constructor(queue: Queue<unknown>) {
    super();

    this._queue = queue;
  }

  async sendMessage(
    message: Pick<
      QueueMessage,
      "topic" | "endpoint" | "headers" | "queryParameters"
    >,
  ) {
    const id = crypto.randomUUID();

    await this._queue.send({
      ...message,
      id,
    });
  }

  async sendMessages(
    messages: Pick<
      QueueMessage,
      "topic" | "endpoint" | "headers" | "queryParameters"
    >[],
  ) {
    const messagesToSend = messages.map((message) => ({
      body: {
        id: crypto.randomUUID(),
        ...message,
      },
    }));

    await this._queue.sendBatch(messagesToSend);
  }
}
