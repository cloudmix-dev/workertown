import { createRouter, validate } from "@workertown/hono";
import MiniSearch, { type MatchInfo } from "minisearch";
import { z } from "zod";

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
      after: z.string().optional(),
    })
  ),
  async (ctx) => {
    const cache = ctx.get("cache");
    const storage = ctx.get("storage");
    const { scanRange: scanRangeRn, stopWords: stopWordsFn } =
      ctx.get("config");
    const tenant = ctx.req.param("tenant")!;
    const index = ctx.req.param("index");
    const { term, tags, fields, limit, after } = ctx.req.valid("query");
    const scanRange =
      typeof scanRangeRn === "function"
        ? await scanRangeRn(ctx.req)
        : scanRangeRn;
    const stopWords =
      typeof stopWordsFn === "function"
        ? await stopWordsFn(ctx.req)
        : stopWordsFn;
    let items: any[] = [];
    let results: {
      id: any;
      item: any;
      score: number;
      terms: string[];
      match: MatchInfo;
    }[] = [];
    let pagination: {
      hasNextPage: boolean;
      endCursor: string | null;
    } = {
      hasNextPage: false,
      endCursor: null,
    };

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

    const resultCount = results.length;

    if (resultCount > 0) {
      if (after) {
        const afterId = atob(after);
        const afterIndex = results.findIndex((result) => result.id === afterId);

        if (afterIndex !== -1) {
          const startIndex = afterIndex + 1;

          results = results.slice(startIndex, startIndex + limit);

          pagination.hasNextPage = resultCount - (startIndex + limit) > 0;
        }
      } else {
        results = results.slice(0, limit);

        pagination.hasNextPage = resultCount - limit > 0;
      }

      pagination.endCursor = btoa(results[results.length - 1]!.id);
    }

    return ctx.jsonT({ status: 200, success: true, data: results, pagination });
  }
);

export type SearchRoute = typeof search;

export { router };
