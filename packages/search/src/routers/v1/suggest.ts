import { createRouter, validate } from "@workertown/internal-server";
import MiniSearch, { type Suggestion } from "minisearch";
import { z } from "zod";

import { type SearchDocument } from "../../storage/storage-adapter.js";
import { type Context } from "../../types.js";

const router = createRouter<Context>();

const suggestQuerySchema = z.object({
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
});

router.get(
  "/:tenant/:index?",
  validate("query", suggestQuerySchema),
  async (ctx) => {
    const tenant = ctx.req.param("tenant") as string;
    const index = ctx.req.param("index");
    const storage = ctx.get("storage");
    const { search } = ctx.get("config");
    const {
      boostDocument,
      filterDocument,
      scanRange: scanRangeFn,
      stopWords: stopWordsFn,
    } = search;
    const { term, tags, fields, limit, fuzzy, prefix, exact } = ctx.req.valid(
      "query" as never,
    ) as z.infer<typeof suggestQuerySchema>;
    const scanRange =
      typeof scanRangeFn === "function"
        ? await scanRangeFn(ctx.req as unknown as Request)
        : scanRangeFn;
    const stopWords = new Set(
      typeof stopWordsFn === "function"
        ? await stopWordsFn(ctx.req as unknown as Request)
        : stopWordsFn,
    );
    // biome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the documents
    let documents: any[] = [];
    let results: Suggestion[] = [];

    if (term) {
      if (tags?.length && tags.length > 0) {
        documents = await storage.getDocumentsByTags(tags, {
          tenant,
          index,
          limit: scanRange,
        });
      } else {
        documents = await storage.getDocuments({
          tenant,
          index,
          limit: scanRange,
        });
      }

      if (documents.length > 0) {
        const documentsMap = new Map<string, SearchDocument>(
          documents.map((document) => [document.id, document]),
        );
        const miniSearch = new MiniSearch({
          fields: fields ?? [],
          processTerm: (term, _fieldName) =>
            stopWords.has(term) ? null : term.toLowerCase(),
          autoSuggestOptions: {
            boostDocument:
              typeof boostDocument === "function"
                ? (id, term) => {
                    const document = documentsMap.get(id);

                    return boostDocument(document as SearchDocument, term);
                  }
                : undefined,
            combineWith: exact ? "AND" : "OR",
            filter:
              typeof filterDocument === "function"
                ? (result) => {
                    const document = documentsMap.get(result.id);

                    return filterDocument(document as SearchDocument, result);
                  }
                : undefined,
            fuzzy,
            prefix,
          },
        });

        miniSearch.addAll(
          documents.map((document) => ({ id: document.id, ...document.data })),
        );

        results = miniSearch.autoSuggest(term);
      }
    }

    if (results.length > limit) {
      results = results.slice(0, limit);
    }

    return ctx.json({ status: 200, success: true, data: results });
  },
);

export { router };
