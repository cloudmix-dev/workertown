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

router.options("/upload/:id", (ctx) =>
  ctx.text("OK", {
    headers: CORS_HEADERS,
  }),
);

router.post("/upload/:id", async (ctx) => {
  const storage = ctx.get("storage");
  const files = ctx.get("files");
  const id = ctx.req.param("id");
  const uploadUrl = await storage.getUploadUrl(id);

  if (!ctx.req.body) {
    return ctx.json(
      { status: 400, success: false, data: null, error: "No body provided" },
      400,
    );
  }

  if (!uploadUrl) {
    return ctx.json(
      { status: 404, success: false, data: null, error: "Not found" },
      404,
    );
  }

  const { fileName, metadata } = uploadUrl;

  await files.put(fileName, ctx.req.body as ReadableStream, metadata);

  if (uploadUrl.callbackUrl) {
    let attempts = 0;

    while (attempts < 3) {
      attempts += 1;

      try {
        const res = await fetch(uploadUrl.callbackUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(metadata),
        });

        if (res.ok) {
          break;
        }
      } catch (_) {}
    }
  }

  await storage.deleteUploadUrl(id);

  return ctx.json({ status: 200, success: true, data: { id } });
});

router.options("/open-api.json", (ctx) =>
  ctx.text("OK", {
    headers: CORS_HEADERS,
  }),
);

router.get("/open-api.json", (ctx) => {
  const { basePath = "/", endpoints } = ctx.get("config");
  const url = new URL(ctx.req.url);
  const replacementPaths: Record<string, string | false> = {
    "/v1/files": endpoints.v1.files,
    "/v1/admin": endpoints.v1.admin,
    "/uploads": endpoints.public
      ? `${endpoints.public === "/" ? "" : endpoints.public}/uploads`
      : false,
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
