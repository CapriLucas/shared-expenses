import { User } from "../entities/User";
import { Expense, RecurrenceType } from "../entities/Expense";
import request from "supertest";
import app from "../app";
import { createTestUser, generateAuthToken, clearDatabase } from "./helpers";
import { getDataSource } from "../database/context";

describe("Expenses", () => {
  let expenseRepository: any;
  let testUser: User;
  let testPayer: User;
  let authToken: string;

  beforeEach(async () => {
    expenseRepository = getDataSource().getRepository(Expense);
    await clearDatabase();

    testUser = await createTestUser();
    testPayer = await createTestUser("payer@example.com");
    authToken = generateAuthToken(testUser);
  });

  describe("POST /api/expenses", () => {
    const validExpense = {
      description: "Test Expense",
      amount: 100.5,
      dueDate: new Date().toISOString(),
      recurrenceType: RecurrenceType.NONE,
    };

    it("should create a new expense", async () => {
      const response = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          ...validExpense,
          payerId: testPayer.id,
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        description: validExpense.description,
        amount: validExpense.amount,
        isPaid: false,
      });

      // Verify expense was saved to database
      const savedExpense = await expenseRepository.findOne({
        where: { id: response.body.id },
        relations: { creator: true, payer: true },
      });
      expect(savedExpense).toBeTruthy();
      expect(savedExpense.creator.id).toBe(testUser.id);
      expect(savedExpense.payer.id).toBe(testPayer.id);
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.errors).toHaveLength(5); // description, amount, dueDate, payerId, recurrenceType
    });

    it("should validate amount is positive", async () => {
      const response = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ...validExpense, amount: -100 });

      expect(response.status).toBe(400);
      expect(response.body.errors[0].field).toBe("amount");
    });

    it("should require authentication", async () => {
      const response = await request(app)
        .post("/api/expenses")
        .send(validExpense);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/expenses", () => {
    beforeEach(async () => {
      // Create test expenses
      await expenseRepository.save([
        {
          description: "Test 1",
          amount: 100,
          dueDate: new Date(),
          creator: testUser,
          payer: testPayer,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          description: "Test 2",
          amount: 200,
          dueDate: new Date(),
          creator: testPayer,
          payer: testUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    });

    it("should return user's expenses as creator and payer", async () => {
      const response = await request(app)
        .get("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it("should include related entities", async () => {
      const response = await request(app)
        .get("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.body[0]).toHaveProperty("creator");
      expect(response.body[0]).toHaveProperty("payer");
      expect(response.body[0]).toHaveProperty("payments");
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/expenses");
      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/expenses/:id", () => {
    let testExpense: Expense;

    beforeEach(async () => {
      testExpense = await expenseRepository.save({
        description: "Test",
        amount: 100,
        dueDate: new Date(),
        creator: testUser,
        payer: testPayer,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it("should return expense details", async () => {
      const response = await request(app)
        .get(`/api/expenses/${testExpense.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testExpense.id);
    });

    it("should return 404 for non-existent expense", async () => {
      const response = await request(app)
        .get("/api/expenses/999999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it("should deny access to unauthorized users", async () => {
      const unauthorizedUser = await createTestUser("unauthorized@example.com");
      const unauthorizedToken = generateAuthToken(unauthorizedUser);

      const response = await request(app)
        .get(`/api/expenses/${testExpense.id}`)
        .set("Authorization", `Bearer ${unauthorizedToken}`);

      expect(response.status).toBe(403);
    });

    it("should require authentication", async () => {
      const response = await request(app).get(
        `/api/expenses/${testExpense.id}`
      );
      expect(response.status).toBe(401);
    });
  });
});
