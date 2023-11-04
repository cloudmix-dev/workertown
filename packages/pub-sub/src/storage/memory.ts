import { MemoryStorageAdapter as BaseMemoryStorageAdapter } from "@workertown/internal-storage/memory";

import {
  type CreateSubscriptionBody,
  type StorageAdapter,
  type Subscription,
} from "./storage-adapter.js";

interface MemoryStorageAdapterOptions {
  initialSubscriptions?: Subscription[];
}

export class MemoryStorageAdapter
  extends BaseMemoryStorageAdapter
  implements StorageAdapter
{
  private readonly _subscriptionStore = new Map<string, Subscription>();

  constructor(options: MemoryStorageAdapterOptions = {}) {
    super();

    const { initialSubscriptions = [] } = options;

    for (const subscription of initialSubscriptions) {
      this._subscriptionStore.set(subscription.id, subscription);
    }
  }

  async getSubscriptions() {
    return Array.from(this._subscriptionStore.values());
  }

  async getSubscriptionsByTopic(topic: string) {
    return Array.from(this._subscriptionStore.values()).filter(
      (item) => item.topic === topic,
    );
  }

  async createSubscription(subscription: CreateSubscriptionBody) {
    const id = Math.random().toString(36).slice(2, 9);
    const subscriptionRecord = { ...subscription, id, createdAt: new Date() };

    this._subscriptionStore.set(id, subscriptionRecord);

    return subscriptionRecord;
  }

  async deleteSubscription(id: string) {
    this._subscriptionStore.delete(id);
  }
}
