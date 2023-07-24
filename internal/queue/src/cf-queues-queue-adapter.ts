import { type Queue } from "@cloudflare/workers-types";

import { QueueAdapter, type QueueMessage } from "./queue-adapter.js";

export class CfQueuesQueueAdapter extends QueueAdapter {
  private _queue: Queue<QueueMessage>;

  constructor(queue: Queue<unknown>) {
    super();

    this._queue = queue;
  }

  async sendMessage(body: Record<string, unknown>) {
    const id = crypto.randomUUID();

    await this._queue.send({
      id,
      body,
    });
  }

  async sendMessages(bodies: Record<string, unknown>[]) {
    const messagesToSend = bodies.map((body) => ({
      body: {
        id: crypto.randomUUID(),
        body,
      },
    }));

    await this._queue.sendBatch(messagesToSend);
  }
}
