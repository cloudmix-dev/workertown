import { type Queue } from "@cloudflare/workers-types";

import { QueueAdapter, type QueueMessage } from "./queue-adapter";

export class CfQueuesQueueAdapter extends QueueAdapter {
  private _queue: Queue<QueueMessage>;

  constructor(queue: Queue<any>) {
    super();

    this._queue = queue;
  }

  async sendMessage(
    message: Pick<
      QueueMessage,
      "topic" | "endpoint" | "headers" | "queryParameters"
    >,
    attempts: number = 0
  ) {
    const id = crypto.randomUUID();

    await this._queue.send({
      ...message,
      id,
      attempts,
    });
  }

  async sendMessages(
    messages: {
      message: Pick<
        QueueMessage,
        "topic" | "endpoint" | "headers" | "queryParameters"
      >;
      attempts?: number | undefined;
    }[]
  ) {
    const messagesToSend = messages.map(({ message, attempts = 0 }) => ({
      body: {
        id: crypto.randomUUID(),
        ...message,
        attempts,
      },
    }));

    await this._queue.sendBatch(messagesToSend);
  }
}
