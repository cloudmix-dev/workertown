import { type DeepPartial } from "@workertown/internal-types";
import { type MiddlewareHandler } from "hono";
import merge from "lodash.merge";

interface BasicOptions {
  username?: string;
  password?: string;
  env: {
    username: string;
    password: string;
  };
}

export type BasicOptionsOptional = DeepPartial<BasicOptions>;

const DEFAULT_OPTIONS: BasicOptions = {
  env: {
    username: "AUTH_USERNAME",
    password: "AUTH_PASSWORD",
  },
};

export function basic(options?: BasicOptionsOptional) {
  const {
    username: optionsUsername,
    password: optionsPassword,
    env: { username: usernameEnvKey, password: passwordEnvKey },
  } = merge({}, DEFAULT_OPTIONS, options);
  const handler: MiddlewareHandler = (ctx, next) => {
    const username = (optionsUsername ?? ctx.env?.[usernameEnvKey]) as string;
    const password = (optionsPassword ?? ctx.env?.[passwordEnvKey]) as string;
    const user = ctx.get("user") ?? null;

    if (user === null && username && password) {
      const authHeader = ctx.req.headers.get("Authorization");

      if (typeof authHeader === "string" && authHeader.startsWith("Basic ")) {
        const [type, credentials] = authHeader.split(" ");

        if (type === "Basic" && credentials) {
          const decodedAuthHeader = atob(credentials);
          const [headerUsername, headerPassword] = decodedAuthHeader.split(":");

          if (headerUsername === username && headerPassword === password) {
            ctx.set("user", { id: username });
          }
        }
      }
    }

    return next();
  };

  return handler;
}
