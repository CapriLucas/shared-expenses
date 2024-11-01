import { query, param } from "express-validator";

export const searchUsersValidator = [
  query("query")
    .isString()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Search query must be at least 2 characters long"),
];

export const userIdValidator = [
  param("id").isInt().withMessage("Invalid user ID"),
];
