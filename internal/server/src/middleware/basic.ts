import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";

import { type Middleware, type User } from "../types.js";

interface BasicOptions {
  username?: string;
  password?: string;
  env: {
    username: string;
    password: string;
  };
  getCredentials: (
    req: Request,
  ) => [username: string, password: string] | null | undefined;
  verifyCredentials?: (
    username: string,
    password: string,
  ) => boolean | Promise<boolean>;
}

export type BasicOptionsOptional = DeepPartial<BasicOptions>;

const DEFAULT_OPTIONS: BasicOptions = {
  env: {
    username: "AUTH_USERNAME",
    password: "AUTH_PASSWORD",
  },
  getCredentials: (req) => {
    const authHeader = req.headers.get("Authorization");

    if (typeof authHeader === "string" && authHeader.startsWith("Basic ")) {
      const [type, credentials] = authHeader.split(" ");

      if (type === "Basic" && credentials) {
        const decodedAuthHeader = atob(credentials);
        const [username, password] = decodedAuthHeader.split(":");

        if (username && password) {
          return [username, password];
        }
      }
    }
  },
};

export function basic(options?: BasicOptionsOptional) {
  const {
    username: optionsUsername,
    password: optionsPassword,
    env: { username: usernameEnvKey, password: passwordEnvKey },
    getCredentials,
    verifyCredentials,
  } = merge({}, DEFAULT_OPTIONS, options);
  const handler: Middleware = async (ctx, next) => {
    const username = (optionsUsername ?? ctx.env?.[usernameEnvKey]) as string;
    const password = (optionsPassword ?? ctx.env?.[passwordEnvKey]) as string;
    const user = ctx.get("user") ?? null;

    if (user === null) {
      const credentials = getCredentials(ctx.req as unknown as Request);

      if (credentials) {
        const [credentialsUsername, credentialsPassword] = credentials;
        const allowed =
          typeof verifyCredentials === "function"
            ? await verifyCredentials(
                credentialsUsername ?? "",
                credentialsPassword ?? "",
              )
            : credentialsUsername === username &&
              credentialsPassword === password;

        if (allowed) {
          ctx.set("user", { id: username, strategy: "basic" } as User);
        }
      }
    }

    return next();
  };

  return handler;
}
