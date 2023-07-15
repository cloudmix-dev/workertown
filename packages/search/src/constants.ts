export const DEFAULT_SCAN_RANGE = 1000;

export const DEFAULT_SORT_FIELD = "updated_at";

// Taken from: https://gist.github.com/sebleier/554280
export const DEFAUlT_STOP_WORDS = new Set([
  "i",
  "me",
  "my",
  "myself",
  "we",
  "our",
  "ours",
  "ourselves",
  "you",
  "your",
  "yours",
  "yourself",
  "yourselves",
  "he",
  "him",
  "his",
  "himself",
  "she",
  "her",
  "hers",
  "herself",
  "it",
  "its",
  "itself",
  "they",
  "them",
  "their",
  "theirs",
  "themselves",
  "what",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "am",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "do",
  "does",
  "did",
  "doing",
  "a",
  "an",
  "the",
  "and",
  "but",
  "if",
  "or",
  "because",
  "as",
  "until",
  "while",
  "of",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "to",
  "from",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
]);

export const OPEN_API_SPEC = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Workertown Search",
    license: {
      name: "MIT",
    },
  },
  servers: [
    {
      url: "http://localhost:8787",
    },
  ],
  paths: {
    "/v1/search/{tenant}": {
      get: {
        summary: "Search across a tenant",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "searchTenant",
        tags: ["Search"],
        parameters: [
          {
            name: "tenant",
            in: "path",
            required: true,
            description: "The tenant to search",
            schema: {
              type: "string",
            },
          },
          {
            name: "term",
            in: "query",
            description: "The term to search for",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "fields",
            in: "query",
            description: "Comma separated list of fields to search within",
            required: false,
            schema: {
              type: "string",
            },
          },
          {
            name: "tags",
            in: "query",
            description: "Comma separated list of tags to filter the search by",
            required: false,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "An array of matching items",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SearchResult",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerError",
                },
              },
            },
          },
        },
      },
    },
    "/v1/search/{tenant}/{index}": {
      get: {
        summary: "Search across a tenant and index",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "searchTenantAndIndex",
        tags: ["Search"],
        parameters: [
          {
            name: "tenant",
            in: "path",
            required: true,
            description: "The tenant to search",
            schema: {
              type: "string",
            },
          },
          {
            name: "index",
            in: "path",
            required: true,
            description: "The index to search",
            schema: {
              type: "string",
            },
          },
          {
            name: "term",
            in: "query",
            description: "The term to search for",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "fields",
            in: "query",
            description: "Comma separated list of fields to search within",
            required: false,
            schema: {
              type: "string",
            },
          },
          {
            name: "tags",
            in: "query",
            description: "Comma separated list of tags to filter the search by",
            required: false,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "An array of matching items",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SearchResult",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerError",
                },
              },
            },
          },
        },
      },
    },
    "/v1/suggest/{tenant}": {
      get: {
        summary: "Suggest terms for a tenant",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "suggestTenant",
        tags: ["Suggest"],
        parameters: [
          {
            name: "tenant",
            in: "path",
            required: true,
            description: "The tenant to search",
            schema: {
              type: "string",
            },
          },
          {
            name: "term",
            in: "query",
            description: "The term to search for",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "fields",
            in: "query",
            description: "Comma separated list of fields to search within",
            required: false,
            schema: {
              type: "string",
            },
          },
          {
            name: "tags",
            in: "query",
            description: "Comma separated list of tags to filter the search by",
            required: false,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "An array of matching items",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuggestResult",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerError",
                },
              },
            },
          },
        },
      },
    },
    "/v1/suggest/{tenant}/{index}": {
      get: {
        summary: "Suggest terms for a tenant",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "suggestTenantAndIndex",
        tags: ["Suggest"],
        parameters: [
          {
            name: "tenant",
            in: "path",
            required: true,
            description: "The tenant to search",
            schema: {
              type: "string",
            },
          },
          {
            name: "index",
            in: "path",
            required: true,
            description: "The index to search",
            schema: {
              type: "string",
            },
          },
          {
            name: "term",
            in: "query",
            description: "The term to search for",
            required: true,
            schema: {
              type: "string",
            },
          },
          {
            name: "fields",
            in: "query",
            description: "Comma separated list of fields to search within",
            required: false,
            schema: {
              type: "string",
            },
          },
          {
            name: "tags",
            in: "query",
            description: "Comma separated list of tags to filter the search by",
            required: false,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "An array of matching items",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SuggestResult",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerError",
                },
              },
            },
          },
        },
      },
    },
  } as any,
  components: {
    securitySchemes: {
      BasicAuth: {
        type: "http",
        scheme: "basic",
      },
      BearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      SearchResult: {
        properties: {
          status: {
            type: "integer",
            format: "int32",
            example: 200,
          },
          success: {
            type: "boolean",
            example: true,
          },
          data: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "a2282e3f-553a-44c2-aa93-590f7b711eba",
              },
              item: {
                type: "object",
                additionalProperties: true,
                example: {
                  id: "1",
                  tenant: "test",
                  index: "test",
                  data: {
                    title: "Test item 1",
                    content: "This is some test content",
                  },
                  createdAt: "<SOME DATE>",
                  updatedAt: "<SOME DATE>",
                },
              },
              score: {
                type: "number",
                format: "float",
                example: 0.4315231086776713,
              },
              terms: {
                type: "array",
                items: {
                  type: "string",
                },
                example: ["test"],
              },
              match: {
                type: "object",
                additionalProperties: true,
                example: {
                  test: ["content"],
                },
              },
            },
          },
        },
      },
      SuggestResult: {
        properties: {
          status: {
            type: "integer",
            format: "int32",
            example: 200,
          },
          success: {
            type: "boolean",
            example: true,
          },
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                suggestion: {
                  type: "string",
                  example: "test",
                },
                terms: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  example: ["test"],
                },
                score: {
                  type: "number",
                  format: "float",
                  example: 0.4315231086776713,
                },
              },
            },
          },
        },
      },
      InternalServerError: {
        type: "object",
        required: ["status", "success", "data", "error"],
        properties: {
          status: {
            type: "integer",
            format: "int32",
            example: 500,
          },
          success: {
            type: "boolean",
            example: false,
          },
          data: {
            type: "object",
            example: null,
          },
          error: {
            type: "string",
            example: "Internal server error",
          },
        },
      },
    },
  },
};
