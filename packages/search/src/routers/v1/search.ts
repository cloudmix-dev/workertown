import { createRouter, validate } from "@workertown/hono";
import MiniSearch, { type MatchInfo } from "minisearch";
import { z } from "zod";

import { type SearchDocument } from "../../storage/index.js";
import { type Context } from "../../types.js";

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
      boostDocument,
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
    let documents: any[] = [];
    let results: {
      id: any;
      document: any;
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
      const cacheKey = `documents_${tenant}_${index ?? "ALL"}`;

      if (tags?.length && tags.length > 0) {
        const tagCacheKey = `${cacheKey}_tags_${tags.sort().join("_")}`;
        const cachedDocuments = await cache.get<any[]>(tagCacheKey);

        if (cachedDocuments) {
          documents = cachedDocuments;
        } else {
          documents = await storage.getDocumentsByTags(tags, {
            tenant,
            index,
            limit: scanRange,
          });

          await cache.set(tagCacheKey, documents);
        }
      } else {
        const cachedDocuments = await cache.get<any[]>(cacheKey);

        if (cachedDocuments) {
          documents = cachedDocuments;
        } else {
          documents = await storage.getDocuments({
            tenant,
            index,
            limit: scanRange,
          });

          await cache.set(cacheKey, documents);
        }
      }

      if (documents.length > 0) {
        const documentsMap = new Map<string, SearchDocument>(
          documents.map((document) => [document.id, document])
        );
        const miniSearch = new MiniSearch({
          fields: fields ?? [],
          processTerm: (term, _fieldName) =>
            stopWords.has(term) ? null : term.toLowerCase(),
          searchOptions: {
            boostDocument:
              typeof boostDocument === "function"
                ? (id, term) => {
                    const document = documentsMap.get(id);

                    return boostDocument(document!, term);
                  }
                : undefined,
            combineWith: exact ? "AND" : "OR",
            filter:
              typeof filter === "function"
                ? (result) => {
                    const document = documentsMap.get(result.id);

                    return filter(document!, result);
                  }
                : undefined,
            fuzzy,
            prefix,
          },
        });

        miniSearch.addAll(
          documents.map((document) => ({ id: document.id, ...document.data }))
        );

        const matches = miniSearch.search(term);

        results = matches.map((match) => {
          const document = documentsMap.get(match.id);

          return {
            id: match.id,
            document,
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