import { createRouter, validate } from "@workertown/internal-server";
import { z } from "zod";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

function getPath(req: Request, config: Context["config"]) {
  const { files: filesPrefix } = config.endpoints.v1;
  const url = new URL(req.url);
  const path = url.pathname
    .replace(filesPrefix as string, "")
    .replace(/^\//, "");

  return path;
}

const getFileQuerySchema = z.object({
  metadata: z
    .string()
    .optional()
    .transform((val) => val === "1" || val === "true"),
});

router.get("/*", validate("query", getFileQuerySchema), async (ctx) => {
  const config = ctx.get("config");
  const files = ctx.get("files");
  const { metadata } = ctx.req.valid("query" as never) as z.infer<
    typeof getFileQuerySchema
  >;
  const path = getPath(ctx.req as unknown as Request, config);

  if (metadata) {
    const metadata = await files.getMetadata(path);

    return ctx.json({ status: 200, success: true, data: { metadata } });
  }

  const file = await files.get(path);

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
});

const uploadFileBodySchema = z.object({
  file: z.any(),
  metadata: z
    .string()
    .optional()
    .transform((val) => (val ? JSON.parse(val) : null)),
});

router.put("/*", validate("form", uploadFileBodySchema), async (ctx) => {
  const config = ctx.get("config");
  const files = ctx.get("files");
  const { file: fileData, metadata } = ctx.req.valid(
    "form" as never,
  ) as z.infer<typeof uploadFileBodySchema>;
  const path = getPath(ctx.req as unknown as Request, config);

  await files.put(path, fileData, metadata ?? undefined);

  return ctx.json({ status: 200, success: true, data: { path } });
});

router.delete("/*", async (ctx) => {
  const config = ctx.get("config");
  const files = ctx.get("files");
  const path = getPath(ctx.req as unknown as Request, config);

  await files.delete(path);

  return ctx.json({ status: 200, success: true, data: { path } });
});

export { router };
