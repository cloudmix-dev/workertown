import { QueueAdapter, type QueueMessage } from "./queue-adapter.js";

export class MemoryQueueAdapter extends QueueAdapter {
  private _queue: QueueMessage[] = [];

  async sendMessage(body: Record<string, unknown>): Promise<void> {
    this._queue.unshift({
      id: crypto.randomUUID(),
      body,
    });
  }

  async sendMessages(bodies: Record<string, unknown>[]): Promise<void> {
    this._queue.unshift(
      ...bodies.map((body) => ({
        id: crypto.randomUUID(),
        body,
      })),
    );
  }

  async ackMessage(id: string): Promise<void> {
    this._queue = this._queue.filter((message) => message.id !== id);
  }

  // biome-ignore lint/correctness/noUnusedVariables: no-op
  async retryMessage(id: string): Promise<void> {}

  async pullMessages(): Promise<QueueMessage[]> {
    return this._queue.slice(0, 10);
  }
}
