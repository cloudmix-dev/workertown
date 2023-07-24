import { type Queue } from "@cloudflare/workers-types";

import { QueueAdapter, type QueueMessage } from "./queue-adapter.js";

export class CfQueuesQueueAdapter extends QueueAdapter {
  private readonly _queue: Queue<QueueMessage>;

  constructor(queue: Queue<unknown>) {
    super();

    this._queue = queue;
  }

  // rome-ignore lint/suspicious/noExplicitAny: Need to allow any type of body
  async sendMessage(body: any) {
    const id = crypto.randomUUID();

    await this._queue.send({
      id,
      body,
    });
  }

  // rome-ignore lint/suspicious/noExplicitAny: Need to allow any type of body
  async sendMessages(bodies: any[]) {
    const messagesToSend = bodies.map((body) => ({
      body: {
        id: crypto.randomUUID(),
        body,
      },
    }));

    await this._queue.sendBatch(messagesToSend);
  }
}
