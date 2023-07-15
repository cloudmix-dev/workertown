import { StorageAdapter, type Subscription } from "./storage-adapter.js";

export class MemoryStorageAdapter extends StorageAdapter {
  private _itemStore = new Map<string, Subscription>();

  async getSubscriptions(): Promise<Subscription[]> {
    return Array.from(this._itemStore.values());
  }

  async getSubscriptionsByTopic(topic: string): Promise<Subscription[]> {
    return Array.from(this._itemStore.values()).filter(
      (item) => item.topic === topic
    );
  }

  async createSubscription(
    subscription: Pick<
      Subscription,
      "topic" | "endpoint" | "headers" | "queryParameters"
    >
  ): Promise<Subscription> {
    const id = Math.random().toString(36).slice(2, 9);
    const item = { ...subscription, id, createdAt: new Date() };

    this._itemStore.set(id, item);

    return item;
  }

  async deleteSubscription(id: string): Promise<void> {
    this._itemStore.delete(id);
  }
}
