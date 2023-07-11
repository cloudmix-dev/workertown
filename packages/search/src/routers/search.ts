import { createRouter, validate } from "@workertown/hono";
import MiniSearch, { type MatchInfo } from "minisearch";
import { z } from "zod";

import { DEFAULT_SORT_FIELD } from "../constants";
import { Context } from "../types";

const router = createRouter<Context>();

const search = router.get(
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
      order_by: z.string().optional().default(DEFAULT_SORT_FIELD),
    })
  ),
  async (ctx) => {
    const cache = ctx.get("cache");
    const storage = ctx.get("storage");
    const { scanRange, stopWords } = ctx.get("config");
    const tenant = ctx.req.param("tenant")!;
    const index = ctx.req.param("index");
    const { term, tags, fields, order_by: orderBy } = ctx.req.valid("query");
    let items: any[] = [];
    let results: {
      id: any;
      item: any;
      score: number;
      terms: string[];
      match: MatchInfo;
    }[] = [];

    if (term) {
      const cacheKey = `items_${tenant}_${index ?? "ALL"}`;

      if (tags?.length && tags.length > 0) {
        const tagCacheKey = `${cacheKey}_tags_${tags.sort().join("_")}`;
        const cachedItems = await cache.get<any[]>(tagCacheKey);

        if (cachedItems) {
          items = cachedItems;
        } else {
          items = await storage.getItemsByTags(tags, {
            tenant,
            index,
            limit: scanRange,
            orderBy,
          });

          await cache.set(tagCacheKey, items);
        }
      } else {
        const cachedItems = await cache.get<any[]>(cacheKey);

        if (cachedItems) {
          items = cachedItems;
        } else {
          items = await storage.getItems({ tenant, index, limit: scanRange });

          await cache.set(cacheKey, items);
        }
      }

      if (items.length > 0) {
        const miniSearch = new MiniSearch({
          fields: fields ?? [],
          processTerm: (term, _fieldName) =>
            stopWords.has(term) ? null : term.toLowerCase(),
        });

        miniSearch.addAll(items.map((item) => ({ id: item.id, ...item.data })));

        const matches = miniSearch.search(term);
        const itemsMap = new Map(items.map((item) => [item.id, item]));

        results = matches.map((match) => {
          const item = itemsMap.get(match.id);

          return {
            id: match.id,
            item,
            score: match.score,
            terms: match.terms,
            match: match.match,
          };
        });
      }
    }

    return ctx.jsonT({ status: 200, success: true, data: results });
  }
);

export type SearchRoute = typeof search;

export { router };
