import { createRouter, validate } from "@workertown/internal-hono";
import { generateOpenApiSpec } from "@workertown/internal-open-api";
import { z } from "zod";

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

router.post(
  "/upload/:id",
  validate(
    "form",
    z.object({
      file: z.any(),
    }),
  ),
  async (ctx) => {
    const config = ctx.get("config");
    const storage = ctx.get("storage");
    const files = ctx.get("files");
    const id = ctx.req.param("id");
    const { file: fileData } = ctx.req.valid("form");
    const uploadUrl = await storage.getUploadUrl(id);
    const signingKey =
      config.files.uploadSigningKey ??
      (ctx.env[config.env.signingKey] as string);

    if (!uploadUrl) {
      return ctx.json(
        { status: 404, success: false, data: null, error: "Not found" },
        404,
      );
    }

    await files.put(uploadUrl.path, fileData, uploadUrl.metadata);

    if (uploadUrl.callbackUrl) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(signingKey),
        "HMAC",
        false,
        ["sign"],
      );
      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(
          JSON.stringify({
            id,
            path: uploadUrl.path,
            callbackUrl: uploadUrl.callbackUrl,
            metadata: uploadUrl.metadata,
          }),
        ),
      );
      let attempts = 0;

      while (attempts < 3) {
        attempts += 1;

        try {
          const res = await fetch(uploadUrl.callbackUrl, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-workertown-signature": decoder.decode(signature),
            },
            body: JSON.stringify({
              id,
              path: uploadUrl.path,
              callbackUrl: uploadUrl.callbackUrl,
              metadata: uploadUrl.metadata,
            }),
          });

          if (res.ok) {
            break;
          }
        } catch (_) {}
      }
    }

    await storage.deleteUploadUrl(id);

    return ctx.json({
      status: 200,
      success: true,
      data: { path: uploadUrl.path },
    });
  },
);

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
