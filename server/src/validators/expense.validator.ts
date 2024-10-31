import { body, param } from "express-validator";
import { RecurrenceType } from "../entities/Expense";

export const createExpenseValidator = [
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 255 })
    .withMessage("Description must be less than 255 characters"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("dueDate").isISO8601().withMessage("Invalid due date format"),

  body("recurrenceType")
    .isIn(Object.values(RecurrenceType))
    .withMessage("Invalid recurrence type"),

  body("recurrenceEndDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invalid recurrence end date format"),

  body("payerId").isInt().withMessage("Invalid payer ID"),
];

export const expenseIdValidator = [
  param("id").isInt().withMessage("Invalid expense ID"),
];

export const updateExpenseValidator = [
  ...expenseIdValidator,
  body("description")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Description must be less than 255 characters"),

  body("amount")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("dueDate").optional().isISO8601().withMessage("Invalid due date format"),

  body("recurrenceType")
    .optional()
    .isIn(Object.values(RecurrenceType))
    .withMessage("Invalid recurrence type"),

  body("recurrenceEndDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Invalid recurrence end date format"),
];
