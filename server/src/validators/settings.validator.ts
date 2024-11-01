import { body } from "express-validator";

export const updateSettingsValidator = [
  body("notifications")
    .optional()
    .isObject()
    .withMessage("Invalid notifications format"),

  body("notifications.newExpenses")
    .optional()
    .isBoolean()
    .withMessage("newExpenses must be a boolean"),

  body("notifications.payments")
    .optional()
    .isBoolean()
    .withMessage("payments must be a boolean"),

  body("notifications.dueDates")
    .optional()
    .isBoolean()
    .withMessage("dueDates must be a boolean"),

  body("currency")
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),

  body("dateFormat")
    .optional()
    .isString()
    .isIn(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"])
    .withMessage("Invalid date format"),

  body("language")
    .optional()
    .isString()
    .isLength({ min: 2, max: 5 })
    .withMessage("Invalid language code"),

  body("display")
    .optional()
    .isObject()
    .withMessage("Invalid display settings format"),

  body("display.theme")
    .optional()
    .isIn(["light", "dark"])
    .withMessage("Theme must be either light or dark"),

  body("display.compactView")
    .optional()
    .isBoolean()
    .withMessage("compactView must be a boolean"),
];
