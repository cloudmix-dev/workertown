import { createRouter } from "@workertown/hono";

import { OPEN_API_SPEC } from "../constants.js";
import { type Context } from "../types.js";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-private-network": "true",
};

const router = createRouter<Context>({ public: true });

router.options("*", (ctx) =>
  ctx.text("OK", {
    headers: CORS_HEADERS,
  })
);

router.get("/open-api.json", (ctx) => {
  const { auth, basePath, prefixes } = ctx.get("config");
  const url = new URL(ctx.req.url);
  const searchPath = `${`${basePath}${prefixes.search}`.replace(
    "//",
    "/"
  )}/{tenant}`;
  const searchIndexPath = `${`${basePath}${prefixes.search}`.replace(
    "//",
    "/"
  )}/{tenant}/{index}`;

  OPEN_API_SPEC.servers[0]!.url = `${url.protocol}//${url.host}`;

  if (!OPEN_API_SPEC.paths[searchPath]) {
    const search = OPEN_API_SPEC.paths["/v1/search/{tenant}"];

    OPEN_API_SPEC.paths[searchPath] = search;

    delete OPEN_API_SPEC.paths["/v1/search/{tenant}"];
  }

  if (!OPEN_API_SPEC.paths[searchIndexPath]) {
    const searchIndex = OPEN_API_SPEC.paths["/v1/search/{tenant}/{index}"];

    OPEN_API_SPEC.paths[searchIndexPath] = searchIndex;

    delete OPEN_API_SPEC.paths["/v1/search/{tenant}/{index}"];
  }

  return ctx.json(OPEN_API_SPEC, {
    headers: CORS_HEADERS,
  });
});

router.get("/health", async (ctx) =>
  ctx.json(
    { status: 200, success: true, data: "OK" },
    { headers: CORS_HEADERS }
  )
);

export { router };
