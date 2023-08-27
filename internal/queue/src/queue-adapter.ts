import { type MigrationResultSet } from "kysely";

export type QueueMessage<T = Record<string, unknown>> = {
  id: string;
  body: T;
};

export class QueueAdapter {
  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  async sendMessage(body: Record<string, unknown>): Promise<void> {
    throw new Error("'sendMessage()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  async sendMessages(bodies: Record<string, unknown>[]): Promise<void> {
    throw new Error("'sendMessages()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  async ackMessage(id: string): Promise<void> {}

  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  async retryMessage(id: string): Promise<void> {}

  async pullMessages(): Promise<QueueMessage[]> {
    return [];
  }

  // rome-ignore lint/correctness/noUnusedVariables: Stub class
  public async runMigrations(down?: boolean): Promise<MigrationResultSet> {
    return { results: [] };
  }
}
