export interface QueueMessage {
  id: string;
  topic: string;
  endpoint: string;
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
  body?: Record<any, unknown>;
  attempts: number;
}

export class QueueAdapter {
  sendMessage(
    message: Pick<
      QueueMessage,
      "topic" | "endpoint" | "headers" | "queryParameters"
    >,
    attempts: number = 0
  ): Promise<void> {
    throw new Error("'sendMessage()' not implemented");
  }

  async sendMessages(
    messages: {
      message: Pick<
        QueueMessage,
        "topic" | "endpoint" | "headers" | "queryParameters"
      >;
      attempts?: number;
    }[]
  ): Promise<void> {
    throw new Error("'sendMessages()' not implemented");
  }

  async pullMessages(): Promise<void> {}
}
