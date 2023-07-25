import { type DeepPartial } from "@workertown/internal-types";
import { type MiddlewareHandler } from "hono";
import merge from "lodash.merge";
import { inRange } from "range_check";

interface IpOptions {
  ips: string[];
}

export type IpOptionsOptional = DeepPartial<IpOptions>;

const DEFAULT_OPTIONS: IpOptions = {
  ips: [],
};

export function ip(options?: IpOptionsOptional) {
  const { ips } = merge({}, DEFAULT_OPTIONS, options);

  const handler: MiddlewareHandler = async (ctx, next) => {
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
      );
    }

    await next();
  };

  return handler;
}
