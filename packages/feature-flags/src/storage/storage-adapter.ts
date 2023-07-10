export interface FlagContext {
  field: string;
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "nin";
  value: string | number | boolean | string[] | number[] | boolean[];
}

export interface Flag {
  name: string;
  description?: string;
  enabled: boolean;
  context?: FlagContext[];
  createdAt: Date;
  updatedAt: Date;
}

export class StorageAdapter {
  async getFlags(disabled?: boolean): Promise<Flag[]> {
    throw new Error("'getFlags()' not implemented");
  }

  async getFlag(name: string): Promise<Flag | null> {
    throw new Error("'getFlag()' not implemented");
  }

  async upsertFlag(
    flag: Pick<Flag, "name" | "description" | "enabled" | "context">
  ): Promise<Flag> {
    throw new Error("'upsertFlag()' not implemented");
  }

  async deleteFlag(name: string): Promise<void> {
    throw new Error("'deleteFlag()' not implemented");
  }

  async runMigrations(): Promise<void> {}
}
