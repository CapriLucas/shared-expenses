import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import { Expense } from "../entities/Expense";
import { RecurrenceType } from "../entities/Expense";
import { Payment } from "../entities/Payment";
import { getDataSource } from "../database/context";

let userIdCounter = 1;

export const createTestUser = async (
  email: string = "test@example.com"
): Promise<User> => {
  const userRepository = getDataSource().getRepository(User);

  const user = new User();
  user.id = userIdCounter++;
  user.email = email;
  user.name = "Test User";
  user.googleId = `google-${Math.random()}`;
  user.avatarUrl = "https://example.com/avatar.jpg";

  return await userRepository.save(user);
};

export const generateAuthToken = (user: User): string => {
  return jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || "test-secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    }
  );
};

export const clearDatabase = async () => {
  try {
    const paymentRepository = getDataSource().getRepository(Payment);
    const expenseRepository = getDataSource().getRepository(Expense);
    const userRepository = getDataSource().getRepository(User);

    await paymentRepository.delete({});
    await expenseRepository.delete({});
    await userRepository.delete({});

    userIdCounter = 1;
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
};

export const createTestExpense = async (
  creator: User,
  payer: User,
  data: Partial<Expense> = {}
): Promise<Expense> => {
  const expenseRepository = getDataSource().getRepository(Expense);

  const expense = new Expense();
  Object.assign(expense, {
    description: "Test Expense",
    amount: 100,
    dueDate: new Date(),
    recurrenceType: RecurrenceType.NONE,
    creator,
    payer,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  });

  return await expenseRepository.save(expense);
};
