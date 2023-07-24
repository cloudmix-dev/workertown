import { StorageAdapter as BaseStorageAdapter } from "@workertown/internal-storage";

export interface Subscription {
  id: string;
  topic: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
  createdAt: Date;
}

export interface CreateSubscriptionBody {
  topic: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  queryParameters?: Record<string, string>;
}

export class StorageAdapter extends BaseStorageAdapter {
  async getSubscriptions(): Promise<Subscription[]> {
    throw new Error("'getSubscriptions()' not implemented");
  }

  async getSubscriptionsByTopic(topic: string): Promise<Subscription[]> {
    throw new Error("'getSubscriptionsByTopic()' not implemented");
  }

  async createSubscription(
    subscription: CreateSubscriptionBody,
  ): Promise<Subscription> {
    throw new Error("'createSubscription' not implemented");
  }

  async deleteSubscription(id: string): Promise<void> {
    throw new Error("'deleteSubscription' not implemented");
  }
}
