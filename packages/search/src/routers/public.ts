import { createRouter } from "@workertown/internal-hono";
import { generateOpenApiSpec } from "@workertown/internal-open-api";

import { OPEN_API_SPEC } from "../constants.js";
import { type Context } from "../types.js";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-private-network": "true",
};

const router = createRouter<Context>({ public: true });

router.options("/open-api.json", (ctx) =>
  ctx.text("OK", {
    headers: CORS_HEADERS,
  }),
);

router.get("/open-api.json", (ctx) => {
  const { basePath = "/", endpoints } = ctx.get("config");
  const url = new URL(ctx.req.url);
  const replacementPaths: Record<string, string | false> = {
    "/v1/search": endpoints.v1.search,
    "/v1/suggest": endpoints.v1.suggest,
    "/v1/docs": endpoints.v1.documents,
    "/v1/admin": endpoints.v1.admin,
    "/health": endpoints.public
      ? `${endpoints.public === "/" ? "" : endpoints.public}/health`
      : false,
  };
  const spec = generateOpenApiSpec(OPEN_API_SPEC, {
    basePath,
    urls: [`${url.protocol}//${url.host}`],
    endpoints: replacementPaths,
  });

  return ctx.json(spec, {
    headers: CORS_HEADERS,
  });
});

router.get("/health", async (ctx) =>
  ctx.json({ status: 200, success: true, data: "OK" }),
);

export { router };
