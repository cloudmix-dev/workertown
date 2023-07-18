import { type DeepPartial } from "@workertown/internal-types";
import { type MiddlewareHandler } from "hono";
import merge from "lodash.merge";

interface IpOptions {
  ips: string[];
}

export type IpOptionsOptional = DeepPartial<IpOptions>;

const DEFAULT_OPTIONS: IpOptions = {
  ips: ["0.0.0.0/0"],
};

interface Cidr {
  range: number;
  mask: number;
}

function ip4ToNumber(ip: string) {
  return (
    ip.split(".").reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0
  );
}

function createCidr(cidr: string) {
  const [range, bits = "32"] = cidr.split("/");
  const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1);

  return { range: ip4ToNumber(range as string), mask } as Cidr;
}

function ip4inCidrs(ip: string, cidrs: Cidr[]) {
  const ipNumber = ip4ToNumber(ip);

  return cidrs.some(
    (cidr) => (ipNumber & cidr.mask) === (cidr.range & cidr.mask),
  );
}

export function ip(options?: IpOptionsOptional) {
  const { ips } = merge(DEFAULT_OPTIONS, options);
  const allowAll = ips.includes("0.0.0.0/0");
  const cidrs = ips.map((ip) => createCidr(ip));

  const handler: MiddlewareHandler = async (ctx, next) => {
    if (allowAll) {
      await next();
      return;
    }

    const ip =
      ctx.req.headers.get("cf-connecting-ip") ??
      ctx.req.headers.get("x-forwarded-for") ??
      ctx.req.headers.get("x-real-ip") ??
      "0.0.0.0/0";
    const allowed = ip4inCidrs(ip, cidrs);

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
