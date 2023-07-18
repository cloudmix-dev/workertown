import { StorageAdapter as BaseStorageAdapter } from "@workertown/internal-storage";

export interface Subscription {
  id: string;
  topic: string;
  endpoint: string;
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
  createdAt: Date;
}

export class StorageAdapter extends BaseStorageAdapter {
  async getSubscriptions(): Promise<Subscription[]> {
    throw new Error("'getSubscriptions()' not implemented");
  }

  async getSubscriptionsByTopic(topic: string): Promise<Subscription[]> {
    throw new Error("'getSubscriptionsByTopic()' not implemented");
  }

  async createSubscription(
    subscription: Pick<
      Subscription,
      "topic" | "endpoint" | "headers" | "queryParameters"
    >,
  ): Promise<Subscription> {
    throw new Error("'createSubscription' not implemented");
  }

  async deleteSubscription(id: string): Promise<void> {
    throw new Error("'deleteSubscription' not implemented");
  }
}
