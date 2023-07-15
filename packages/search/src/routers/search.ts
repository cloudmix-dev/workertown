import { createRouter, validate } from "@workertown/hono";
import MiniSearch, { type MatchInfo } from "minisearch";
import { z } from "zod";

import { type SearchItem } from "../storage/index.js";
import { type Context } from "../types.js";

const router = createRouter<Context>();

router.get(
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
      fuzzy: z
        .string()
        .optional()
        .transform((val) => {
          if (val) {
            const fuzzy = parseFloat(val);

            if (Number.isNaN(fuzzy)) {
              return undefined;
            }

            return fuzzy;
          }
        }),
      prefix: z
        .string()
        .optional()
        .transform((val) => val === "1" || val === "true"),
      exact: z
        .string()
        .optional()
        .transform((val) => val === "1" || val === "true"),
    })
  ),
  async (ctx) => {
    const cache = ctx.get("cache");
    const storage = ctx.get("storage");
    const {
      boostItem,
      filter,
      scanRange: scanRangeRn,
      stopWords: stopWordsFn,
    } = ctx.get("config");
    const tenant = ctx.req.param("tenant")!;
    const index = ctx.req.param("index");
    const { term, tags, fields, limit, after, fuzzy, prefix, exact } =
      ctx.req.valid("query");
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
        const itemsMap = new Map<string, SearchItem>(
          items.map((item) => [item.id, item])
        );
        const miniSearch = new MiniSearch({
          fields: fields ?? [],
          processTerm: (term, _fieldName) =>
            stopWords.has(term) ? null : term.toLowerCase(),
          searchOptions: {
            boostDocument:
              typeof boostItem === "function"
                ? (id, term) => {
                    const item = itemsMap.get(id);

                    return boostItem(item!, term);
                  }
                : undefined,
            combineWith: exact ? "AND" : "OR",
            filter:
              typeof filter === "function"
                ? (result) => {
                    const item = itemsMap.get(result.id);

                    return filter(item!, result);
                  }
                : undefined,
            fuzzy,
            prefix,
          },
        });

        miniSearch.addAll(items.map((item) => ({ id: item.id, ...item.data })));

        const matches = miniSearch.search(term);

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

    return ctx.json({ status: 200, success: true, data: results, pagination });
  }
);

export { router };
