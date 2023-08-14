import { StorageAdapter } from "./storage-adapter.js";
import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

export type DynamoDBTableOptions = {
  globalSecondaryIndexes: number;
} & (
  | {
      billingMode: "PROVISIONED";
      readCapacityUnits: number;
      writeCapacityUnits: number;
    }
  | {
      billingMode: "PAY_PER_REQUEST";
    }
);

export interface DynamoDBStorageAdapterOptions {
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
  };
  options?: DynamoDBTableOptions;
  region: string;
  table: string;
}

export class DynamoDBStorageAdapter extends StorageAdapter {
  public readonly client: DynamoDBClient;

  public readonly table: string;

  private readonly _tableOptions: DynamoDBTableOptions;

  constructor(options: DynamoDBStorageAdapterOptions) {
    // The AWS SDK tries to use crypto from off of the window, so we need to
    // trick it into finding it where it expects it
    if (!globalThis.window) {
      // @ts-ignore
      globalThis.window = {};
    }

    if (!globalThis.window.crypto) {
      window.crypto = crypto;
    }

    super();

    this.client = new DynamoDBClient({
      credentials: {
        accessKeyId: options.credentials.accessKeyId,
        secretAccessKey: options.credentials.secretAccessKey,
      },
    });
    this.table = options.table;
    this._tableOptions = {
      ...(options.options ?? {
        billingMode: "PAY_PER_REQUEST",
      }),
      globalSecondaryIndexes: options.options?.globalSecondaryIndexes ?? 0,
    };
  }

  protected getGsiName(index: number) {
    return `gsi_${index}`;
  }

  protected getGsiKey(index: number, key: string) {
    return `gsi_${index}_${key}`;
  }

  public async runMigrations() {
    try {
      await this.client.send(
        new DescribeTableCommand({ TableName: this.table }),
      );
    } catch (_) {
      await this.client.send(
        new CreateTableCommand({
          TableName: this.table,
          AttributeDefinitions: [
            {
              AttributeName: "pk",
              AttributeType: "S",
            },
            {
              AttributeName: "sk",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "pk",
              KeyType: "HASH",
            },
            {
              AttributeName: "sk",
              KeyType: "RANGE",
            },
          ],
          BillingMode: this._tableOptions.billingMode,
          ProvisionedThroughput:
            this._tableOptions.billingMode === "PROVISIONED"
              ? {
                  ReadCapacityUnits: this._tableOptions.readCapacityUnits,
                  WriteCapacityUnits: this._tableOptions.writeCapacityUnits,
                }
              : undefined,
          GlobalSecondaryIndexes: new Array(
            this._tableOptions.globalSecondaryIndexes,
          )
            .fill(null)
            .map((_, i) => ({
              IndexName: this.getGsiName(i + 1),
              KeySchema: [
                {
                  AttributeName: this.getGsiKey(i + 1, "pk"),
                  KeyType: "HASH",
                },
                {
                  AttributeName: this.getGsiKey(i + 1, "sk"),
                  KeyType: "RANGE",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
            })),
        }),
      );
    }

    return { results: [] };
  }
}
