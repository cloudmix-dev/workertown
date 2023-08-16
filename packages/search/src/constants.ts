import { type OpenApiSpec } from "@workertown/internal-open-api";

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

export const OPEN_API_SPEC: OpenApiSpec = {
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
    "/v1/docs/{id}": {
      get: {
        summary: "Get a search document",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "getDocument",
        tags: ["Documents"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the search document",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "The search document",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GetDocumentResult",
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
      put: {
        summary: "Upsert a search document",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "upsertDocument",
        tags: ["Documents"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the search document",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          description: "The search document to upsert",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpsertDocumentBody",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "The upserted document",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpsertDocumentResult",
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
      delete: {
        summary: "Delete a search document",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "deleteDocument",
        tags: ["Documents"],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "The ID of the search document",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "The deleted document ID",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteDocumentResult",
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
    "/v1/tags": {
      get: {
        summary: "Get all tags",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "getTags",
        tags: ["Tags"],
        responses: {
          "200": {
            description: "An array of tags",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TagsResult",
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
    "/v1/admin/info": {
      get: {
        summary: "Get configuration information",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "adminInfo",
        tags: ["Admin"],
        responses: {
          "200": {
            description: "The current configuration",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AdminInfoResult",
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
    "/v1/admin/migrate": {
      post: {
        summary: "Run database migrations",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "adminMigrate",
        tags: ["Admin"],
        responses: {
          "200": {
            description: "The successfully run migrations",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AdminMigrateResult",
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
    "/health": {
      get: {
        summary: "Get service health",
        security: [],
        operationId: "health",
        tags: ["Public"],
        responses: {
          "200": {
            description: "The service health status",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PublicHealthResult",
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
    // rome-ignore lint/suspicious/noExplicitAny: We don't care about the type here
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
      SearchDocument: {
        properties: {
          id: {
            type: "string",
            example: "1",
          },
          tenant: {
            type: "string",
            example: "test",
          },
          index: {
            type: "string",
            example: "test",
          },
          data: {
            type: "object",
            additionalProperties: true,
            example: {
              title: "Test item 1",
              content: "This is some test content",
            },
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2023-08-07T07:48:53.852Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2023-08-07T07:48:53.852Z",
          },
        },
      },
      UpsertDocumentBody: {
        properties: {
          tenant: {
            type: "string",
            example: "test",
            required: true,
          },
          index: {
            type: "string",
            example: "test",
            required: true,
          },
          data: {
            type: "object",
            additionalProperties: true,
            example: {
              title: "Test item 1",
              content: "This is some test content",
            },
          },
          tags: {
            type: "array",
            items: {
              type: "string",
              example: "test",
            },
          },
        },
      },
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
                $ref: "#/components/schemas/SearchDocument",
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
      GetDocumentResult: {
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
            $ref: "#/components/schemas/SearchDocument",
          },
        },
      },
      UpsertDocumentResult: {
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
            $ref: "#/components/schemas/SearchDocument",
          },
        },
      },
      DeleteDocumentResult: {
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
                example: "1",
              },
            },
          },
        },
      },
      TagsResult: {
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
              type: "string",
            },
            example: ["test"],
          },
        },
      },
      AdminInfoResult: {
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
          },
        },
      },
      AdminMigrateResult: {
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
                migrationName: {
                  type: "string",
                  example: "1688823193041_add_initial_tables_and_indexes",
                },
                direction: {
                  type: "string",
                  example: "Up",
                },
                status: {
                  type: "string",
                  example: "Success",
                },
              },
            },
          },
        },
      },
      PublicHealthResult: {
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
            type: "string",
            example: "OK",
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
