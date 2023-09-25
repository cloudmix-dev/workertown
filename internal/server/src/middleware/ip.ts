import { type DeepPartial } from "@workertown/internal-types";
import merge from "lodash.merge";
import { inRange } from "range_check";

import { type MiddlewareHandler } from "../router.js";

interface IpOptions {
  ips: string[];
}

export type IpOptionsOptional = DeepPartial<IpOptions>;

const DEFAULT_OPTIONS: IpOptions = {
  ips: [],
};

export function ip(options?: IpOptionsOptional) {
  const { ips } = merge({}, DEFAULT_OPTIONS, options);

  // biome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
  const handler: MiddlewareHandler<any> = async (ctx, next) => {
    const ip =
      ctx.req.headers.get("cf-connecting-ip") ??
      ctx.req.headers.get("x-forwarded-for") ??
      ctx.req.headers.get("x-real-ip") ??
      "0.0.0.0/0";
    let allowed = false;

    for (const range of ips) {
      if (inRange(ip, range)) {
        allowed = true;

        break;
      }
    }

    if (!allowed) {
      return ctx.json(
        {
          success: false,
          status: 403,
          data: null,
          error: "Forbidden",
        },
        403,
        {
          "X-Workertown-Hint": "The origin IP is not authorized",
        },
      );
    }

    await next();
  };

  return handler;
}
