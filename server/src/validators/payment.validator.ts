import { body, param } from "express-validator";

export const createPaymentValidator = [
  body("expenseId").isInt().withMessage("Invalid expense ID"),

  body("amount")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),

  body("paymentDate").isISO8601().withMessage("Invalid payment date format"),
];

export const paymentIdValidator = [
  param("id").isInt().withMessage("Invalid payment ID"),
];

export const verifyPaymentValidator = [
  ...paymentIdValidator,
  body("isVerified")
    .isBoolean()
    .withMessage("isVerified must be a boolean value"),
];
