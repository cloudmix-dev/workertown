import {
  type AttributeValue,
  DeleteItemCommand,
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
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
  pk: AttributeValue.SMember;
  sk: AttributeValue.SMember;
  // Tracks *all* items in the tenanr
  gsi_1_pk: AttributeValue.SMember;
  gsi_1_sk: AttributeValue.SMember;
  // Tracks items in the tenant by index
  gsi_2_pk: AttributeValue.SMember;
  gsi_2_sk: AttributeValue.SMember;
  // The item data in full as we return it from the API
  data: {
    id: AttributeValue.SMember;
    tenant: AttributeValue.SMember;
    index: AttributeValue.SMember;
    data: AttributeValue.MMember;
    createdAt: AttributeValue.SMember;
    updatedAt: AttributeValue.SMember;
  };
  // The item's tags
  tags: AttributeValue.SSMember;
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
      id: document.data.id.S,
      tenant: document.data.tenant.S,
      index: document.data.index.S,
      data: document.data.data.M,
      tags: document.tags.SS,
      createdAt: new Date(document.data.createdAt.S),
      updatedAt: new Date(document.data.updatedAt.S),
    };
  }

  public async getDocuments(options: GetDocumentsOptions) {
    const gsi = options.index ? 2 : 1;
    const key = this._getPrimaryKey(options.tenant, options.index);
    const keyCondition = "#pk = :pk";
    const expressionAttributeNames = {
      "#pk": this.getGsiKey(1, "pk"),
    };
    const expressionAttributeValues = {
      ":pk": {
        S: key,
      },
    };
    const result = await this.client.send(
      new QueryCommand({
        TableName: this.table,
        IndexName: this.getGsiName(gsi),
        Select: "ALL_ATTRIBUTES",
        KeyConditionExpression: keyCondition,
        // @ts-ignore
        ExpressionAttributeNames: expressionAttributeNames,
        // @ts-ignore
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
    const filterExpression = `tags in (${tags
      .map((_, index) => `:tag_${index + 1}`)
      .join(", ")})`;
    const expressionAttributeNames = {
      "#pk": this.getGsiKey(1, "pk"),
    };
    const expressionAttributeValues = {
      ":pk": {
        S: key,
      },
    };

    tags.forEach((tag) => {
      // @ts-ignore
      expressionAttributeValues[`:tag_${index + 1}`] = {
        S: tag,
      };
    });

    const result = await this.client.send(
      new QueryCommand({
        TableName: this.table,
        IndexName: gsi ? this.getGsiName(1) : undefined,
        Select: "ALL_ATTRIBUTES",
        KeyConditionExpression: keyCondition,
        FilterExpression: filterExpression,
        // @ts-ignore
        ExpressionAttributeNames: expressionAttributeNames,
        // @ts-ignore
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
      new GetItemCommand({
        TableName: this.table,
        Key: {
          pk: {
            S: this._getPrimaryKey(id),
          },
          sk: {
            S: id,
          },
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
      ...(existing?.data ?? {}),
      ...item,
      updatedAt: now.toISOString(),
    };

    if (!newItem.createdAt) {
      newItem.createdAt = now.toISOString();
    }

    await this.client.send(
      new UpdateItemCommand({
        TableName: this.table,
        Key: {
          pk: {
            S: this._getPrimaryKey(item.id),
          },
          sk: {
            S: item.id,
          },
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
          ":data": {
            M: newItem as Record<string, AttributeValue>,
          },
          ":tags": {
            SS: tags,
          },
          ":gsi1pk": {
            S: this._getPrimaryKey(item.tenant),
          },
          ":gsi1sk": {
            S: `${Number.MAX_SAFE_INTEGER - now.getTime()}`,
          },
          ":gsi2pk": {
            S: this._getPrimaryKey(item.tenant, item.index),
          },
          ":gsi2sk": {
            S: `${Number.MAX_SAFE_INTEGER - now.getTime()}`,
          },
        },
        ReturnValues: "ALL_NEW",
      }),
    );

    await Promise.allSettled(
      tags.map((tag) =>
        this.client.send(
          new UpdateItemCommand({
            TableName: this.table,
            Key: {
              pk: {
                S: this._getPrimaryKey("tags"),
              },
              sk: {
                S: tag,
              },
            },
          }),
        ),
      ),
    );

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
      new DeleteItemCommand({
        TableName: this.table,
        Key: {
          pk: {
            S: this._getPrimaryKey(id),
          },
          sk: {
            S: id,
          },
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
        ExpressionAttributeNames: {
          "#pk": "pk",
        },
        ExpressionAttributeValues: {
          ":pk": {
            S: this._getPrimaryKey("tags"),
          },
        },
      }),
    );

    return tags.Items?.map((item) => item.sk?.S as string) ?? [];
  }
}
