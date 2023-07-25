export type QueueMessage<T = Record<string, unknown>> = {
  id: string;
  body: T;
};

export class QueueAdapter {
  // rome-ignore lint/correctness/noUnusedVariables: stub class
  async sendMessage(body: Record<string, unknown>): Promise<void> {
    throw new Error("'sendMessage()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  async sendMessages(bodies: Record<string, unknown>[]): Promise<void> {
    throw new Error("'sendMessages()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  async ackMessage(id: string): Promise<void> {}

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  async retryMessage(id: string): Promise<void> {}

  async pullMessages(): Promise<QueueMessage[]> {
    return [];
  }
}
