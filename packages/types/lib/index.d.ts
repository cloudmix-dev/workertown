// import {
//   type ApiKeyOptions,
//   type BasicOptions,
//   type JwtOptions,
// } from "@workertown/middleware";

// Make all (inc. nested) properties in T optional
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface User {
  id: string;
}

export interface ServiceConfiguration {
  auth?: {
    basic?: BasicOptions | false;
    jwt?: JwtOptions | false;
    apiKey?: ApiKeyOptions | false;
  };
  basePath: string;
}
