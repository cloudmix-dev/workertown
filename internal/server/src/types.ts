export type User = {
  id: string;
} & (
  | {
      strategy: "basic" | "api_key";
      claims: never;
    }
  | {
      strategy: "jwt";
      claims: {
        [x: string]: unknown;
      };
    }
);
