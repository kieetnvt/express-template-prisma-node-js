export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'Express Prisma API',
    version: '1.0.0',
    description:
      'API documentation for authentication and user retrieval endpoints.',
  },
  servers: [
    {
      url: '/',
      description: 'Current server',
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'Account registration and authentication',
    },
    {
      name: 'Users',
      description: 'Authenticated user operations',
    },
  ],
  paths: {
    '/api/v1/auth/sign-up': {
      post: {
        tags: ['Authentication'],
        summary: 'Create a user account',
        operationId: 'signUp',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SignUpRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Account created',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserSuccessResponse',
                },
              },
            },
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Log in with email and password',
        operationId: 'login',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginSuccessResponse',
                },
              },
            },
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get a user',
        description:
          'Use a numeric user ID, or use `me` to retrieve the user identified by the bearer token.',
        operationId: 'getUser',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Numeric user ID or `me`',
            schema: {
              type: 'string',
              pattern: '^(me|[0-9]+)$',
              example: 'me',
            },
          },
        ],
        responses: {
          '200': {
            description: 'User found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/UserSuccessResponse',
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid bearer token',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
            $ref: '#/components/responses/InternalError',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    responses: {
      InternalError: {
        description: 'Validation, database, or application error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ErrorResponse',
            },
          },
        },
      },
    },
    schemas: {
      SignUpRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            minLength: 3,
            maxLength: 30,
            pattern: '^[a-zA-Z0-9]+$',
            example: 'alice',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'alice@example.com',
          },
          password: {
            type: 'string',
            minLength: 3,
            maxLength: 30,
            pattern: '^[a-zA-Z0-9]{3,30}$',
            example: 'password123',
          },
        },
      },
      LoginRequest: {
        type: 'object',
        additionalProperties: false,
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'alice@example.com',
          },
          password: {
            type: 'string',
            minLength: 3,
            maxLength: 30,
            pattern: '^[a-zA-Z0-9]{3,30}$',
            example: 'password123',
          },
        },
      },
      User: {
        type: 'object',
        required: ['id', 'email'],
        properties: {
          id: {
            type: 'integer',
            format: 'int32',
            example: 1,
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'alice@example.com',
          },
          name: {
            type: 'string',
            nullable: true,
            example: 'alice',
          },
        },
      },
      UserSuccessResponse: {
        type: 'object',
        required: ['status', 'data'],
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
          },
          data: {
            type: 'object',
            required: ['user'],
            properties: {
              user: {
                $ref: '#/components/schemas/User',
              },
            },
          },
        },
      },
      LoginSuccessResponse: {
        type: 'object',
        required: ['status', 'data'],
        properties: {
          status: {
            type: 'string',
            enum: ['success'],
          },
          data: {
            type: 'object',
            required: ['token'],
            properties: {
              token: {
                type: 'string',
                description: 'JWT access token valid for one day',
              },
            },
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['status', 'message'],
        properties: {
          status: {
            type: 'string',
            enum: ['error'],
          },
          message: {
            type: 'string',
          },
          stack: {
            type: 'string',
            description:
              'Stack trace returned only outside the production environment.',
          },
        },
      },
    },
  },
} as const;
