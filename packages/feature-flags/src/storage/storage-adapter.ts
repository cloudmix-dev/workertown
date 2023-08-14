import { StorageAdapter as BaseStorageAdapter } from "@workertown/internal-storage";

export type FlagConditionOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "nin";

export interface FlagCondition {
  field: string;
  operator: FlagConditionOperator;
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

export interface UpsertFlagBody {
  name: string;
  description?: string;
  enabled: boolean;
  conditions?: FlagCondition[];
}

export class StorageAdapter extends BaseStorageAdapter {
  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async getFlags(disabled = false): Promise<Flag[]> {
    throw new Error("'getFlags()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async getFlag(name: string): Promise<Flag | null> {
    throw new Error("'getFlag()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async upsertFlag(flag: UpsertFlagBody): Promise<Flag> {
    throw new Error("'upsertFlag()' not implemented");
  }

  // rome-ignore lint/correctness/noUnusedVariables: stub class
  public async deleteFlag(name: string): Promise<void> {
    throw new Error("'deleteFlag()' not implemented");
  }
}
