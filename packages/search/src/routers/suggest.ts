import { createRouter, validate } from "@workertown/hono";
import MiniSearch, { type Suggestion } from "minisearch";
import { z } from "zod";

import { Context } from "../types";

const router = createRouter<Context>();

const suggest = router.get(
  "/:tenant/:index?",
  validate(
    "query",
    z.object({
      term: z.string(),
      fields: z
        .string()
        .optional()
        .transform((val) => val?.split(/,\s?/)),
      tags: z
        .string()
        .optional()
        .transform((val) => val?.split(/,\s?/)),
      limit: z
        .string()
        .optional()
        .default("100")
        .transform((val) => {
          const limit = parseInt(val, 10);

          if (Number.isNaN(limit)) {
            return 100;
          }

          return limit;
        }),
    })
  ),
  async (ctx) => {
    const tenant = ctx.req.param("tenant") as string;
    const index = ctx.req.param("index");
    const storage = ctx.get("storage");
    const { scanRange, stopWords } = ctx.get("config");
    const { term, tags, fields, limit } = ctx.req.valid("query");
    let items: any[] = [];
    let results: Suggestion[] = [];

    if (term) {
      if (tags?.length && tags.length > 0) {
        items = await storage.getItemsByTags(tags, {
          tenant,
          index,
          limit: scanRange,
        });
      } else {
        items = await storage.getItems({ tenant, index, limit: scanRange });
      }

      if (items.length > 0) {
        const miniSearch = new MiniSearch({
          fields: fields ?? [],
          processTerm: (term, _fieldName) =>
            stopWords.has(term) ? null : term.toLowerCase(),
        });

        miniSearch.addAll(items.map((item) => ({ id: item.id, ...item.data })));

        results = miniSearch.autoSuggest(term);
      }
    }

    if (results.length > limit) {
      results = results.slice(0, limit);
    }

    return ctx.jsonT({ status: 200, success: true, data: results });
  }
);

export type SuggestRoute = typeof suggest;

export { router };
