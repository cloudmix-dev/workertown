import { createRouter } from "@workertown/internal-hono";

import { OPEN_API_SPEC } from "../../constants.js";
import { type Context } from "../../types.js";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-private-network": "true",
};

const router = createRouter<Context>({ public: true });

router.options("*", (ctx) =>
  ctx.text("OK", {
    headers: CORS_HEADERS,
  }),
);

router.get("/open-api.json", (ctx) => {
  const { basePath, endpoints } = ctx.get("config");
  const url = new URL(ctx.req.url);
  const searchPath = `${`${basePath}${endpoints.v1.search}`.replace(
    "//",
    "/",
  )}/{tenant}`;
  const searchIndexPath = `${`${basePath}${endpoints.v1.search}`.replace(
    "//",
    "/",
  )}/{tenant}/{index}`;

  if (OPEN_API_SPEC.servers?.[0]) {
    OPEN_API_SPEC.servers[0].url = `${url.protocol}//${url.host}`;
  }

  if (!OPEN_API_SPEC.paths[searchPath]) {
    const search = OPEN_API_SPEC.paths["/v1/search/{tenant}"];

    OPEN_API_SPEC.paths[searchPath] = search;

    OPEN_API_SPEC.paths["/v1/search/{tenant}"] = undefined;
  }

  if (!OPEN_API_SPEC.paths[searchIndexPath]) {
    const searchIndex = OPEN_API_SPEC.paths["/v1/search/{tenant}/{index}"];

    OPEN_API_SPEC.paths[searchIndexPath] = searchIndex;

    OPEN_API_SPEC.paths["/v1/search/{tenant}/{index}"] = undefined;
  }

  return ctx.json(OPEN_API_SPEC, {
    headers: CORS_HEADERS,
  });
});

router.get("/health", async (ctx) =>
  ctx.json(
    { status: 200, success: true, data: "OK" },
    { headers: CORS_HEADERS },
  ),
);

export { router };
