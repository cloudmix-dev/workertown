export interface QueueMessage {
  id: string;
  topic: string;
  endpoint: string;
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
  body?: Record<string, unknown>;
}

export class QueueAdapter {
  async sendMessage(
    message: Pick<
      QueueMessage,
      "topic" | "endpoint" | "headers" | "queryParameters"
    >,
  ): Promise<void> {
    throw new Error("'sendMessage()' not implemented");
  }

  async sendMessages(
    messages: Pick<
      QueueMessage,
      "topic" | "endpoint" | "headers" | "queryParameters"
    >[],
  ): Promise<void> {
    throw new Error("'sendMessages()' not implemented");
  }

  async ackMessage(id: string): Promise<void> {}

  async rescheduleMessage(id: string, delay?: number): Promise<void> {}

  async pullMessages(): Promise<QueueMessage[]> {
    return [];
  }
}
