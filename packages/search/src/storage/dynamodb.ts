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

import {
  type GetDocumentsOptions,
  type SearchDocument,
  type StorageAdapter,
  type UpsertSearchDocumentBody,
} from "./storage-adapter.js";

interface SearchDocumentItem {
  // Tracks items in the tenant by unique ID
  pk: string;
  sk: string;
  // Tracks *all* items in the tenanr
  gsi_1_pk: string;
  gsi_1_sk: string;
  // Tracks items in the tenant by index
  gsi_2_pk: string;
  gsi_2_sk: string;
  // The item data in full as we return it from the API
  data: {
    id: string;
    tenant: string;
    index: string;
    data: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
  // The item's tags
  tags: string[];
}

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
        globalSecondaryIndexes: 2,
      } as DynamoDBTableOptions,
      region: options.region,
      table: options.table ?? "wt-search",
    });
  }

  private _getPrimaryKey(first: string, second?: string) {
    return `wt_search#${first}${second ? `#${second}` : ""}`;
  }

  private _formatDocument(document: SearchDocumentItem): SearchDocument {
    return {
      id: document.data.id,
      tenant: document.data.tenant,
      index: document.data.index,
      data: document.data.data,
      tags: document.tags,
      createdAt: new Date(document.data.createdAt),
      updatedAt: new Date(document.data.updatedAt),
    };
  }

  public async getDocuments(options: GetDocumentsOptions) {
    const gsi = options.index ? 2 : 1;
    const key = this._getPrimaryKey(options.tenant, options.index);
    const keyCondition = "#pk = :pk";
    const expressionAttributeNames = {
      "#pk": this.getGsiKey(gsi, "pk"),
    };
    const expressionAttributeValues = {
      ":pk": key,
    };
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.table,
        IndexName: this.getGsiName(gsi),
        Select: "ALL_ATTRIBUTES",
        KeyConditionExpression: keyCondition,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        Limit: options.limit,
      }),
    );

    return (
      result.Items?.map((item) =>
        this._formatDocument(item as unknown as SearchDocumentItem),
      ) ?? []
    );
  }

  public async getDocumentsByTags(
    tags: string[],
    options: GetDocumentsOptions,
  ) {
    const gsi = options.index ? 2 : 1;
    const key = this._getPrimaryKey(options.tenant, options.index);
    const keyCondition = "#pk = :pk";
    const filterExpression = `${tags
      .map((_, i) => `contains (#tags, :tag_${i + 1})`)
      .join(" AND")}`;
    const expressionAttributeNames = {
      "#pk": this.getGsiKey(2, "pk"),
      "#tags": "tags",
    };
    const expressionAttributeValues = {
      ":pk": key,
    };

    tags.forEach((tag, i) => {
      // @ts-ignore
      expressionAttributeValues[`:tag_${i + 1}`] = tag;
    });

    const result = await this.client.send(
      new QueryCommand({
        TableName: this.table,
        IndexName: gsi ? this.getGsiName(gsi) : undefined,
        Select: "ALL_ATTRIBUTES",
        KeyConditionExpression: keyCondition,
        FilterExpression: filterExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        Limit: options.limit,
      }),
    );

    return (
      result.Items?.map((item) =>
        this._formatDocument(item as unknown as SearchDocumentItem),
      ) ?? []
    );
  }

  public async getDocument(id: string): Promise<SearchDocument | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.table,
        Key: {
          pk: this._getPrimaryKey(id),
          sk: id,
        },
      }),
    );

    return result.Item
      ? this._formatDocument(result.Item as unknown as SearchDocumentItem)
      : null;
  }

  public async upsertDocument(
    item: UpsertSearchDocumentBody,
    tags: string[] = [],
  ): Promise<SearchDocument> {
    const existing = await this.getDocument(item.id);
    const now = new Date();
    const newItem: Record<string, unknown> = {
      ...item,
      createdAt: existing?.createdAt?.toISOString() ?? now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await this.client.send(
      new UpdateCommand({
        TableName: this.table,
        Key: {
          pk: this._getPrimaryKey(item.id),
          sk: item.id,
        },
        UpdateExpression:
          "SET #data = :data, #tags = :tags, #gsi1pk = :gsi1pk, #gsi1sk = :gsi1sk, #gsi2pk = :gsi2pk, #gsi2sk = :gsi2sk",
        ExpressionAttributeNames: {
          "#data": "data",
          "#tags": "tags",
          "#gsi1pk": this.getGsiKey(1, "pk"),
          "#gsi1sk": this.getGsiKey(1, "sk"),
          "#gsi2pk": this.getGsiKey(2, "pk"),
          "#gsi2sk": this.getGsiKey(2, "sk"),
        },
        ExpressionAttributeValues: {
          ":data": newItem,
          ":tags": tags,
          ":gsi1pk": this._getPrimaryKey(item.tenant),
          ":gsi1sk": `${Number.MAX_SAFE_INTEGER - now.getTime()}#${item.id}`,
          ":gsi2pk": this._getPrimaryKey(item.tenant, item.index),
          ":gsi2sk": `${Number.MAX_SAFE_INTEGER - now.getTime()}#${item.id}}`,
        },
        ReturnValues: "NONE",
      }),
    );

    const existingTags = existing?.tags ?? [];
    const tagSet = new Set(existingTags);
    const tagsToAdd = tags.filter((tag) => !tagSet.has(tag));
    const tagsToRemove = existingTags.filter(
      (existingTag) => !tagSet.has(existingTag),
    );

    await Promise.allSettled([
      ...tagsToAdd.map((tag) =>
        this.client.send(
          new UpdateCommand({
            TableName: this.table,
            Key: {
              pk: this._getPrimaryKey("tags"),
              sk: tag,
            },
            UpdateExpression:
              "SET #count = if_not_exists(#count, :zero) + :inc",
            ExpressionAttributeNames: {
              "#count": "count",
            },
            ExpressionAttributeValues: {
              ":inc": 1,
              ":zero": 0,
            },
          }),
        ),
      ),
      ...tagsToRemove.map((tag) =>
        this.client.send(
          new UpdateCommand({
            TableName: this.table,
            Key: {
              pk: this._getPrimaryKey("tags"),
              sk: tag,
            },
            UpdateExpression: "SET #count = if_not_exists(#count, :inc) - :inc",
            ExpressionAttributeNames: {
              "#count": "count",
            },
            ExpressionAttributeValues: {
              ":inc": 1,
            },
          }),
        ),
      ),
    ]);

    return {
      id: newItem.id as string,
      tenant: newItem.tenant as string,
      index: newItem.index as string,
      data: newItem.data as Record<string, unknown>,
      tags,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
  }

  public async deleteDocument(id: string): Promise<void> {
    await this.client.send(
      new DeleteCommand({
        TableName: this.table,
        Key: {
          pk: this._getPrimaryKey(id),
          sk: id,
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
