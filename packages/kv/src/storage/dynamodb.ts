import {
  DeleteCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  DynamoDBStorageAdapter as BaseDynamoDBStorageAdapter,
  type DynamoDBStorageAdapterOptions as BaseDynamoDBStorageAdapterOptions,
  type DynamoDBTableOptions,
} from "@workertown/internal-storage/dynamodb";

import { type StorageAdapter } from "./storage-adapter.js";

type DynamoDBStorageAdapterOptions = Omit<
  BaseDynamoDBStorageAdapterOptions,
  "table" | "options"
> & {
  table?: string;
  options: Omit<DynamoDBTableOptions, "globalSecondaryIndexes">;
};

export class DynamoDBStorageAdapter
  extends BaseDynamoDBStorageAdapter
  implements StorageAdapter
{
  constructor(options: DynamoDBStorageAdapterOptions) {
    super({
      credentials: options.credentials,
      endpoint: options.endpoint,
      options: {
        ...(options.options ?? {}),
        globalSecondaryIndexes: 0,
      } as DynamoDBTableOptions,
      region: options.region,
      table: options.table ?? "wt-kv",
    });
  }

  private _getPrimaryKey(key: string) {
    return `wt_kv#${key}`;
  }

  public async getValue<T = unknown>(key: string) {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.table,
        Key: {
          pk: this._getPrimaryKey(key),
          sk: this._getPrimaryKey(key),
        },
      }),
    );

    return result.Item?.value ? (JSON.parse(result.Item?.value) as T) : null;
  }

  public async setValue<T = unknown>(key: string, value: T) {
    await this.client.send(
      new UpdateCommand({
        TableName: this.table,
        Key: {
          pk: this._getPrimaryKey(key),
          sk: this._getPrimaryKey(key),
        },
        UpdateExpression: "SET #value = :value",
        ExpressionAttributeNames: {
          "#value": "value",
        },
        ExpressionAttributeValues: {
          ":value": JSON.stringify(value),
        },
      }),
    );

    return value;
  }

  public async deleteValue(key: string) {
    await this.client.send(
      new DeleteCommand({
        TableName: this.table,
        Key: {
          pk: this._getPrimaryKey(key),
          sk: this._getPrimaryKey(key),
        },
      }),
    );
  }

  public async getTags(): Promise<string[]> {
    const tags = await this.client.send(
      new QueryCommand({
        TableName: this.table,
        Select: "ALL_ATTRIBUTES",
        KeyConditionExpression: "#pk = :pk",
        FilterExpression: "#count > :zero",
        ExpressionAttributeNames: {
          "#pk": "pk",
          "#count": "count",
        },
        ExpressionAttributeValues: {
          ":pk": this._getPrimaryKey("tags"),
          ":zero": 0,
        },
      }),
    );

    return tags.Items?.map((item) => item.sk as string) ?? [];
  }
}
