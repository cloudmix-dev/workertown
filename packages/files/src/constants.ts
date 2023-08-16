import { type OpenApiSpec } from "@workertown/internal-open-api";

export const OPEN_API_SPEC: OpenApiSpec = {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Workertown Files",
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
    "/v1/files/{key}": {
      get: {
        summary: "Get a file (or it's metadata)",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "getFile",
        tags: ["Files"],
        parameters: [
          {
            name: "metadata",
            in: "query",
            description: "Whether to return the file's metadata",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          "200": {
            description: "An array of matching items",
            content: {
              "application/octet-stream": {},
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GetFileMetadataResponse",
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
        summary: "Store a file",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "putFile",
        tags: ["Files"],
        responses: {
          "200": {
            description: "The file's key",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PutFileResponse",
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
        summary: "Delete a file",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "deleteFile",
        tags: ["Files"],
        responses: {
          "200": {
            description: "The file's key",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/DeleteFileResponse",
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
    "/upload/{id}": {
      post: {
        summary: 'Upload a file via a "signed" public URL',
        security: [],
        operationId: "publicUpload",
        tags: ["Uploads"],
        responses: {
          "200": {
            description: "An array of matching items",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PublicUploadResponse",
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
    "/v1/uploads": {
      post: {
        summary: "Create an upload URL",
        security: [{ BasicAuth: [] }, { BearerAuth: [] }],
        operationId: "createUploadUrl",
        tags: ["Uploads"],
        requestBody: {
          description: "The details for the upload",
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateUploadUrlBody",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "An array of matching items",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateUploadUrlResponse",
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
      CreateUploadUrlBody: {
        type: "object",
        properties: {
          fileName: {
            type: "string",
            example: "test.csv",
            required: true,
          },
          callbackUrl: {
            type: "string",
            example: "https://example.com",
          },
          metadata: {
            type: "object",
            allowAdditionalProperties: true,
            example: {
              test: true,
            },
          },
        },
      },
      GetFileMetadataResponse: {
        type: "object",
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
              metadata: {
                type: "object",
                allowAdditionalProperties: true,
                example: {
                  test: true,
                },
              },
            },
          },
        },
      },
      PutFileResponse: {
        type: "object",
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
              key: {
                type: "string",
                example: "test",
              },
            },
          },
        },
      },
      DeleteFileResponse: {
        type: "object",
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
              key: {
                type: "string",
                example: "test",
              },
            },
          },
        },
      },
      PublicUploadResponse: {
        type: "object",
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
                example: "test",
              },
            },
          },
        },
      },
      CreateUploadUrlResponse: {
        type: "object",
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
                example: "test",
              },
              expiresAt: {
                type: "string",
                format: "date-time",
                example: "2021-07-01T00:00:00.000Z",
              },
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
