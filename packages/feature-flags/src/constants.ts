import { type OpenApiSpec } from "@workertown/internal-open-api";

export const CACHE = {
  FLAGS: {
    ALL: "flags:all",
    ENABLED: "flags:enabled",
  },
};

export const OPEN_API_SPEC: OpenApiSpec = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Workertown Feature Flags",
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
    "/v1/flags": {
      get: {
        summary: "Get all feature flags",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "getAllFlags",
        tags: ["Flags"],
        parameters: [
          {
            name: "include_disabled",
            in: "query",
            description: "Whether to include disabled feature flags",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "An array of feature flags",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GetAllFlagsResponse",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/v1/flags/{name}": {
      get: {
        summary: "Get a feature flag",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "getFlag",
        tags: ["Flags"],
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            description: "The name of the feature flag",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "The feature flag",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GetFlagResponse",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerErrorResponse",
                },
              },
            },
          },
        },
      },
      put: {
        summary: "Upsert a feature flag",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "upsertFlag",
        tags: ["Flags"],
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            description: "The name of the feature flag",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          description: "The feature flag to upsert",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/UpsertFlagBody",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "The feature flag",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/UpsertFlagResponse",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerErrorResponse",
                },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete a feature flag",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "deleteFlag",
        tags: ["Flags"],
        parameters: [
          {
            name: "name",
            in: "path",
            required: true,
            description: "The name of the feature flag",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "The feature flag",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteFlagResponse",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/v1/ask": {
      post: {
        summary: "Ask if feature flag are enabled for a given context",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "ask",
        tags: ["Ask"],
        requestBody: {
          description: "The context to ask about",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/AskBody",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "The enabled feature flags for the context",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AskResponse",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerErrorResponse",
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
                  $ref: "#/components/schemas/AdminInfoResponse",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerErrorResponse",
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
                  $ref: "#/components/schemas/AdminMigrateResponse",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerErrorResponse",
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
                  $ref: "#/components/schemas/PublicHealthResponse",
                },
              },
            },
          },
          default: {
            description: "Unexpected error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/InternalServerErrorResponse",
                },
              },
            },
          },
        },
      },
    },
  },
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
      Flag: {
        properties: {
          name: {
            type: "string",
            example: "example_flag",
          },
          description: {
            type: "string",
            example: "An example flag",
          },
          enabled: {
            type: "boolean",
            example: true,
          },
          conditions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: {
                  type: "string",
                  example: "test",
                },
                operator: {
                  type: "string",
                  example: "eq",
                },
                value: {
                  anyOf: [
                    { type: "string" },
                    { type: "number" },
                    { type: "boolean" },
                  ],
                },
              },
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
      UpsertFlagBody: {
        properties: {
          description: {
            type: "string",
            example: "An example flag",
          },
          enabled: {
            type: "boolean",
            example: true,
          },
          conditions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: {
                  type: "string",
                  example: "test",
                },
                operator: {
                  type: "string",
                  example: "eq",
                },
                value: {
                  anyOf: [
                    { type: "string" },
                    { type: "number" },
                    { type: "boolean" },
                  ],
                },
              },
            },
          },
        },
      },
      AskBody: {
        properties: {
          flags: {
            type: "array",
            items: {
              type: "string",
              example: "example_flag",
            },
          },
          context: {
            type: "object",
            allowAdditionalProperties: true,
            example: {
              userId: "123",
            },
          },
        },
      },
      GetAllFlagsResponse: {
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
              $ref: "#/components/schemas/Flag",
            },
          },
        },
      },
      GetFlagResponse: {
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
            $ref: "#/components/schemas/Flag",
          },
        },
      },
      UpsertFlagResponse: {
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
            $ref: "#/components/schemas/Flag",
          },
        },
      },
      DeleteFlagResponse: {
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
              name: {
                type: "string",
                example: "example_flag",
              },
            },
          },
        },
      },
      AskResponse: {
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
              example: "example_flag",
            },
          },
        },
      },
      AdminInfoResponse: {
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
      AdminMigrateResponse: {
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
      PublicHealthResponse: {
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
      InternalServerErrorResponse: {
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
