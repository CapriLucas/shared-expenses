import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "Shared Expenses API",
    version: "1.0.0",
    description: "API documentation for the Shared Expenses application",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Expense: {
        type: "object",
        properties: {
          id: { type: "integer" },
          description: { type: "string" },
          amount: { type: "number" },
          dueDate: { type: "string", format: "date-time" },
          recurrenceType: {
            type: "string",
            enum: ["none", "weekly", "monthly", "yearly"],
          },
          recurrenceEndDate: {
            type: "string",
            format: "date-time",
            nullable: true,
          },
          isPaid: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string" },
          name: { type: "string" },
          googleId: { type: "string" },
          avatarUrl: { type: "string" },
        },
      },
      Payment: {
        type: "object",
        properties: {
          id: { type: "integer" },
          amount: { type: "number" },
          paymentDate: { type: "string", format: "date-time" },
          receiptUrl: { type: "string" },
          isVerified: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Statistics: {
        type: "object",
        properties: {
          totalPaid: { type: "number" },
          totalPending: { type: "number" },
          totalExpenses: { type: "integer" },
        },
      },
    },
  },
  paths: {
    "/auth/google": {
      post: {
        tags: ["Authentication"],
        summary: "Authenticate with Google",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  token: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Authentication successful",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: { $ref: "#/components/schemas/User" },
                    token: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/expenses": {
      get: {
        tags: ["Expenses"],
        summary: "Get all expenses for the authenticated user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "List of expenses",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Expense" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Expenses"],
        summary: "Create a new expense",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["description", "amount", "dueDate", "payerId"],
                properties: {
                  description: { type: "string" },
                  amount: { type: "number" },
                  dueDate: { type: "string", format: "date-time" },
                  recurrenceType: {
                    type: "string",
                    enum: ["none", "weekly", "monthly", "yearly"],
                  },
                  recurrenceEndDate: {
                    type: "string",
                    format: "date-time",
                    nullable: true,
                  },
                  payerId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Expense created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Expense" },
              },
            },
          },
        },
      },
    },
    "/api/payments": {
      post: {
        tags: ["Payments"],
        summary: "Create a new payment",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["expenseId", "amount", "paymentDate", "receipt"],
                properties: {
                  expenseId: { type: "integer" },
                  amount: { type: "number" },
                  paymentDate: { type: "string", format: "date-time" },
                  receipt: {
                    type: "string",
                    format: "binary",
                    description: "Receipt file (JPEG, PNG, or PDF)",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Payment created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Payment" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Payments"],
        summary: "Get all payments for the authenticated user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "List of payments",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Payment" },
                },
              },
            },
          },
        },
      },
    },
    "/api/expenses/statistics": {
      get: {
        tags: ["Expenses"],
        summary: "Get expense statistics for the authenticated user",
        security: [{ BearerAuth: [] }],
        responses: {
          200: {
            description: "Expense statistics",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Statistics" },
              },
            },
          },
        },
      },
    },
    "/api/payments/{id}/verify": {
      patch: {
        tags: ["Payments"],
        summary: "Verify a payment",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["isVerified"],
                properties: {
                  isVerified: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Payment verified",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Payment" },
              },
            },
          },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
