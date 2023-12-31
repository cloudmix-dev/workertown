import { type Queue } from "@cloudflare/workers-types";

import { QueueAdapter, type QueueMessage } from "./queue-adapter.js";

interface CfQueuesQueueAdapterOptions {
  queue: Queue<unknown>;
  pullMessages?: () => Promise<QueueMessage[]>;
}

export class CfQueuesQueueAdapter extends QueueAdapter {
  private readonly _queue: Queue<QueueMessage>;

  constructor(options: CfQueuesQueueAdapterOptions) {
    super();

    this._queue = options.queue;

    if (options.pullMessages) {
      this.pullMessages = options.pullMessages;
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: Need to allow any type of body
  async sendMessage(body: any) {
    const id = crypto.randomUUID();

    await this._queue.send({
      id,
      body,
    });
  }

  // biome-ignore lint/suspicious/noExplicitAny: Need to allow any type of body
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
