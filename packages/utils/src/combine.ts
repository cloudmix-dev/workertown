import { type Server, createServer } from "@workertown/internal-server";

// biome-ignore lint/suspicious/noExplicitAny: Env and Message can be of *any* type here
export function combine(...args: Server<any, any>[]): Server<any, any> {
  const server = args.reduce(
    (acc, server) => acc.route("/", server.asRouter()),
    createServer({
      access: { ip: false, rateLimit: false },
      auth: { apiKey: false, basic: false, jwt: false },
      logger: false,
      sentry: false,
    }),
  );

  return server as Server;
}
