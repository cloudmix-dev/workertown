import { createRouter, validate } from "@workertown/internal-server";
import { z } from "zod";

import { type Context } from "../../types.js";

const router = createRouter<Context>();

const createUploadUrlBodySchema = z.object({
  path: z.string(),
  callbackUrl: z.string().url().optional(),
  metadata: z.record(z.string()).optional(),
});

router.post("/", validate("json", createUploadUrlBodySchema), async (ctx) => {
  const config = ctx.get("config");
  const storage = ctx.get("storage");
  const { path, callbackUrl, metadata } = ctx.req.valid(
    "json" as never,
  ) as z.infer<typeof createUploadUrlBodySchema>;
  const expiresAt = new Date(Date.now() + config.files.uploadUrlTtl * 1000);
  const uploadUrl = await storage.createUploadUrl({
    path: path.startsWith("/") ? path.slice(1) : path,
    callbackUrl,
    metadata,
    expiresAt,
  });

  return ctx.json({
    status: 200,
    success: true,
    data: { id: uploadUrl.id, expiresAt: expiresAt.toISOString() },
  });
});

export { router };
