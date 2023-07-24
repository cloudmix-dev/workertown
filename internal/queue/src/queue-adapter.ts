export type QueueMessage<T = Record<string, unknown>> = {
  id: string;
  body: T;
};

export class QueueAdapter {
  async sendMessage(body: Record<string, unknown>): Promise<void> {
    throw new Error("'sendMessage()' not implemented");
  }

  async sendMessages(bodies: Record<string, unknown>[]): Promise<void> {
    throw new Error("'sendMessages()' not implemented");
  }

  async ackMessage(id: string): Promise<void> {}

  async retryMessage(id: string): Promise<void> {}

  async pullMessages(): Promise<QueueMessage[]> {
    return [];
  }
}
