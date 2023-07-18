import { StorageAdapter as BaseStorageAdapter } from "@workertown/internal-storage";

export interface FlagCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin";
  value: string | number | boolean | string[] | number[] | boolean[];
}

export interface Flag {
  name: string;
  description?: string;
  enabled: boolean;
  conditions?: FlagCondition[];
  createdAt: Date;
  updatedAt: Date;
}

export class StorageAdapter extends BaseStorageAdapter {
  public async getFlags(disabled = false): Promise<Flag[]> {
    throw new Error("'getFlags()' not implemented");
  }

  public async getFlag(name: string): Promise<Flag | null> {
    throw new Error("'getFlag()' not implemented");
  }

  public async upsertFlag(
    flag: Pick<Flag, "name" | "description" | "enabled" | "conditions">,
  ): Promise<Flag> {
    throw new Error("'upsertFlag()' not implemented");
  }

  public async deleteFlag(name: string): Promise<void> {
    throw new Error("'deleteFlag()' not implemented");
  }
}
