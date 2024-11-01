import { Expense, RecurrenceType } from "../entities/Expense";
import { User } from "../entities/User";
import { getDataSource } from "../database/context";
import { processRecurringExpenses } from "../services/recurringExpense";
import { addDays, subDays, addWeeks, addMonths, addYears } from "date-fns";
import { In, Repository } from "typeorm";

describe("Recurring Expenses", () => {
  let expenseRepository: Repository<Expense>;
  let userRepository: Repository<User>;
  let creator: User;
  let payer: User;

  beforeEach(async () => {
    expenseRepository = getDataSource().getRepository(Expense);
    userRepository = getDataSource().getRepository(User);

    // Create test users
    creator = userRepository.create({
      email: "creator@test.com",
      name: "Creator",
      googleId: "creator123",
      avatarUrl: "https://example.com/creator.jpg",
    });
    await userRepository.save(creator);

    payer = userRepository.create({
      email: "payer@test.com",
      name: "Payer",
      googleId: "payer123",
      avatarUrl: "https://example.com/payer.jpg",
    });
    await userRepository.save(payer);
  });

  describe("Weekly Recurrence", () => {
    it("should create next weekly expense when due", async () => {
      const baseDate = subDays(new Date(), 8); // 8 days ago
      const expense = await createTestExpense(RecurrenceType.WEEKLY, baseDate);

      await processRecurringExpenses();

      const expenses = await expenseRepository.find({
        where: { parentExpense: { id: expense.id } },
        relations: ["parentExpense"],
      });

      expect(expenses).toHaveLength(1);
      expect(expenses[0].dueDate).toEqual(addWeeks(baseDate, 1));
    });

    it("should not create weekly expense if not due yet", async () => {
      const baseDate = subDays(new Date(), 6); // 6 days ago
      const expense = await createTestExpense(RecurrenceType.WEEKLY, baseDate);

      await processRecurringExpenses();

      const expenses = await expenseRepository.find({
        where: { parentExpense: { id: expense.id } },
      });

      expect(expenses).toHaveLength(0);
    });
  });

  describe("Monthly Recurrence", () => {
    it("should create next monthly expense when due", async () => {
      const baseDate = subDays(new Date(), 32); // 32 days ago
      const expense = await createTestExpense(RecurrenceType.MONTHLY, baseDate);

      await processRecurringExpenses();

      const expenses = await expenseRepository.find({
        where: { parentExpense: { id: expense.id } },
        relations: ["parentExpense"],
      });

      expect(expenses).toHaveLength(1);
      expect(expenses[0].dueDate).toEqual(addMonths(baseDate, 1));
    });

    it("should not create monthly expense if not due yet", async () => {
      const baseDate = subDays(new Date(), 25); // 25 days ago
      const expense = await createTestExpense(RecurrenceType.MONTHLY, baseDate);

      await processRecurringExpenses();

      const expenses = await expenseRepository.find({
        where: { parentExpense: { id: expense.id } },
      });

      expect(expenses).toHaveLength(0);
    });
  });

  describe("Yearly Recurrence", () => {
    it("should create next yearly expense when due", async () => {
      const baseDate = subDays(new Date(), 366); // 366 days ago
      const expense = await createTestExpense(RecurrenceType.YEARLY, baseDate);

      await processRecurringExpenses();

      const expenses = await expenseRepository.find({
        where: { parentExpense: { id: expense.id } },
        relations: ["parentExpense"],
      });

      expect(expenses).toHaveLength(1);
      expect(expenses[0].dueDate).toEqual(addYears(baseDate, 1));
    });
  });

  describe("Recurrence End Date", () => {
    it("should not create new expense if end date has passed", async () => {
      const baseDate = subDays(new Date(), 8);
      const endDate = subDays(new Date(), 1);
      const expense = await createTestExpense(
        RecurrenceType.WEEKLY,
        baseDate,
        endDate
      );

      await processRecurringExpenses();

      const expenses = await expenseRepository.find({
        where: { parentExpense: { id: expense.id } },
      });

      expect(expenses).toHaveLength(0);
    });

    it("should create new expense if end date has not passed", async () => {
      const baseDate = subDays(new Date(), 8);
      const endDate = addDays(new Date(), 30);
      const expense = await createTestExpense(
        RecurrenceType.WEEKLY,
        baseDate,
        endDate
      );

      await processRecurringExpenses();

      const expenses = await expenseRepository.find({
        where: { parentExpense: { id: expense.id } },
      });

      expect(expenses).toHaveLength(1);
    });
  });

  describe("Multiple Recurrences", () => {
    it("should create recurring expenses only from parent expense", async () => {
      // Create parent expense 15 days ago
      const baseDate = subDays(new Date(), 15);
      const parentExpense = await createTestExpense(
        RecurrenceType.WEEKLY,
        baseDate
      );

      // First run - should create expense for week 1
      await processRecurringExpenses();

      let expenses = await expenseRepository.find({
        where: { parentExpense: { id: parentExpense.id } },
        order: { dueDate: "ASC" },
      });

      expect(expenses).toHaveLength(2);
      expect(expenses[0].dueDate).toEqual(addWeeks(baseDate, 1));
      expect(expenses[1].dueDate).toEqual(addWeeks(baseDate, 2));

      // Second run - should not create new expenses
      await processRecurringExpenses();

      // Verify that child expenses don't create new recurrences
      const childExpenses = await expenseRepository.find({
        where: { parentExpense: { id: In(expenses.map((e) => e.id)) } },
      });

      expect(childExpenses).toHaveLength(0);
    });
  });

  // Helper function to create test expenses
  const createTestExpense = async (
    recurrenceType: RecurrenceType,
    dueDate: Date,
    recurrenceEndDate?: Date
  ) => {
    const expense = expenseRepository.create({
      description: "Test Expense",
      amount: 100,
      dueDate,
      recurrenceType,
      recurrenceEndDate,
      creator,
      payer,
      lastRecurrence: null,
    });

    return await expenseRepository.save(expense);
  };
});
