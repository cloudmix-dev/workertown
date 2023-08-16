import { type OpenApiSpec } from "@workertown/internal-open-api";

export const OPEN_API_SPEC: OpenApiSpec = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Workertown KV",
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
    "/v1/kv/{key}": {
      get: {
        summary: "Get a value",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "getValue",
        tags: ["Key/Value"],
        parameters: [
          {
            name: "key",
            in: "path",
            required: true,
            description: "The key for the value",
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
                  $ref: "#/components/schemas/GetValueResponse",
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
        summary: "Set a value",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "setValue",
        tags: ["Key/Value"],
        parameters: [
          {
            name: "key",
            in: "path",
            required: true,
            description: "The key for the value",
            schema: {
              type: "string",
            },
          },
        ],
        requestBody: {
          description: "The value to set",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SetValueBody",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "The value to set",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/SetValueResponse",
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
        summary: "Delete a value",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "deleteValue",
        tags: ["Key/Value"],
        parameters: [
          {
            name: "key",
            in: "path",
            required: true,
            description: "The key for the value",
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "The result",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteValueResponse",
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
      SetValueBody: {
        properties: {
          value: {
            oneOf: [
              { type: "string" },
              { type: "number" },
              { type: "boolean" },
              { type: "object" },
              { type: "array" },
            ],
            example: "value",
          },
        },
      },
      GetValueResponse: {
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
            oneOf: [
              { type: "string" },
              { type: "number" },
              { type: "boolean" },
              { type: "object" },
              { type: "array" },
            ],
            example: "value",
          },
        },
      },
      SetValueResponse: {
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
            oneOf: [
              { type: "string" },
              { type: "number" },
              { type: "boolean" },
              { type: "object" },
              { type: "array" },
            ],
            example: "value",
          },
        },
      },
      DeleteValueResponse: {
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
            type: "boolean",
            example: true,
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
