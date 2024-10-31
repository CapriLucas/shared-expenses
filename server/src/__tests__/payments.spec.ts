import { User } from "../entities/User";
import { Expense } from "../entities/Expense";
import request from "supertest";
import app from "../app";
import { createTestUser, generateAuthToken, clearDatabase } from "./helpers";
import { getDataSource } from "../database/context";

describe("Payments", () => {
  let expenseRepository: any;
  let testUser: User;
  let testPayer: User;
  let testExpense: Expense;
  let authToken: string;

  beforeEach(async () => {
    expenseRepository = getDataSource().getRepository(Expense);
    await clearDatabase();

    testUser = await createTestUser();
    testPayer = await createTestUser("payer@example.com");
    authToken = generateAuthToken(testPayer); // Using payer's token

    testExpense = await expenseRepository.save({
      description: "Test Expense",
      amount: 100,
      dueDate: new Date(),
      creator: testUser,
      payer: testPayer,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  describe("POST /api/payments", () => {
    it("should create a new payment", async () => {
      const paymentData = {
        expenseId: testExpense.id,
        amount: 100,
        paymentDate: new Date().toISOString(),
      };

      // Create a mock file buffer
      const mockFile = {
        fieldname: "receipt",
        originalname: "test-receipt.jpg",
        encoding: "7bit",
        mimetype: "image/jpeg",
        buffer: Buffer.from("test file content"),
        size: 1024,
      };

      const response = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .field("expenseId", paymentData.expenseId.toString())
        .field("amount", paymentData.amount.toString())
        .field("paymentDate", paymentData.paymentDate)
        .attach(
          "receipt",
          Buffer.from("test file content"),
          mockFile.originalname
        );

      expect(response.status).toBe(201);

      expect(response.body).toMatchObject({
        amount: paymentData.amount,
        isVerified: false,
        receiptUrl: expect.stringContaining("test-receipt.jpg"),
      });

      // Verify expense is marked as paid
      const updatedExpense = await expenseRepository.findOneBy({
        id: testExpense.id,
      });
      expect(updatedExpense.isPaid).toBe(true);
    });

    it("should require receipt file", async () => {
      const paymentData = {
        expenseId: testExpense.id,
        amount: 100,
        paymentDate: new Date().toISOString(),
      };

      const response = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Receipt file is required");
    });

    it("should validate payment amount", async () => {
      const response = await request(app)
        .post("/api/payments")
        .set("Authorization", `Bearer ${authToken}`)
        .field("expenseId", testExpense.id)
        .field("amount", -100)
        .field("paymentDate", new Date().toISOString())
        .attach("receipt", Buffer.from("test"), "test.jpg");

      expect(response.status).toBe(400);
      expect(response.body.errors[0].field).toBe("amount");
    });
  });
});
