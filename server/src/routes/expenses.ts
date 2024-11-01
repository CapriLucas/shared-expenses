import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStatistics,
} from "../controllers/expenseController";
import { validate } from "../middleware/validate";
import {
  createExpenseValidator,
  expenseIdValidator,
  updateExpenseValidator,
} from "../validators/expense.validator";

const router = Router();

// Apply auth middleware to all expense routes
router.use(authMiddleware);

// Expense routes
router.post("/", validate(createExpenseValidator), createExpense);
router.get("/", getExpenses);

// Add statistics endpoint
router.get("/statistics", getExpenseStatistics);

router.get("/:id", validate(expenseIdValidator), getExpenseById);
router.put("/:id", validate(updateExpenseValidator), updateExpense);
router.delete("/:id", validate(expenseIdValidator), deleteExpense);

export default router;
