import {
  type WorkertownRequest,
  createRouter,
  validate,
} from "@workertown/internal-hono";
import { z } from "zod";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

function getKey(
  req: WorkertownRequest<"/*">,
  config: Context["Variables"]["config"],
) {
  const { files: filesPrefix } = config.endpoints.v1;
  const url = new URL(req.url);
  const key = url.pathname
    .replace(filesPrefix as string, "")
    .replace(/^\//, "");

  return key;
}

router.get(
  "/*",
  validate(
    "query",
    z.object({
      metadata: z
        .string()
        .optional()
        .transform((val) => val === "1" || val === "true"),
    }),
  ),
  async (ctx) => {
    const config = ctx.get("config");
    const files = ctx.get("files");
    const { metadata } = ctx.req.valid("query");
    const key = getKey(ctx.req, config);

    if (metadata) {
      const metadata = await files.getMetadata(key);

      return ctx.json({ status: 200, success: true, data: { metadata } });
    }

    const file = await files.get(key);

    if (!file) {
      return ctx.json(
        { status: 404, success: false, data: null, error: "File not found" },
        404,
      );
    }

    return new Response(file, {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  },
);

router.put("/*", async (ctx) => {
  const config = ctx.get("config");
  const files = ctx.get("files");
  const key = getKey(ctx.req, config);

  if (!ctx.req.body) {
    return ctx.json(
      { status: 400, success: false, data: null, error: "No body provided" },
      400,
    );
  }

  await files.put(key, ctx.req.body);

  return ctx.json({ status: 200, success: true, data: { key } });
});

router.delete("/*", async (ctx) => {
  const config = ctx.get("config");
  const files = ctx.get("files");
  const key = getKey(ctx.req, config);

  await files.delete(key);

  return ctx.json({ status: 200, success: true, data: { key } });
});

export { router };
