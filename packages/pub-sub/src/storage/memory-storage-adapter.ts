import { MemoryStorageAdapter as BaseMemoryStorageAdapter } from "@workertown/internal-storage/memory-storage-adapter";

import { StorageAdapter, type Subscription } from "./storage-adapter.js";

export class MemoryStorageAdapter
  extends BaseMemoryStorageAdapter
  implements StorageAdapter
{
  private readonly _subscriptionStore = new Map<string, Subscription>();

  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this._subscriptionStore.values());
  }

  async getSubscriptionsByTopic(topic: string): Promise<Subscription[]> {
    return Array.from(this._subscriptionStore.values()).filter(
      (item) => item.topic === topic,
    );
  }

  async createSubscription(
    subscription: Pick<
      Subscription,
      "topic" | "endpoint" | "method" | "headers" | "queryParameters"
    >,
  ): Promise<Subscription> {
    const id = Math.random().toString(36).slice(2, 9);
    const subscriptionRecord = { ...subscription, id, createdAt: new Date() };

    this._subscriptionStore.set(id, subscriptionRecord);

    return subscriptionRecord;
  }

  async deleteSubscription(id: string): Promise<void> {
    this._subscriptionStore.delete(id);
  }
}
