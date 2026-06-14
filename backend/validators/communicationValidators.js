import { body, query } from "express-validator";

export const analyzeValidator = [
  body("message")
    .trim()
    .isLength({ min: 2, max: 4000 })
    .withMessage("Message must be between 2 and 4000 characters"),
  body("topic")
    .optional()
    .trim()
    .isLength({ min: 2, max: 240 })
    .withMessage("Topic must be between 2 and 240 characters"),
];

export const historyValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
];

export const exportValidator = [
  query("format").optional().isIn(["json", "csv"]).withMessage("Format must be json or csv"),
];
