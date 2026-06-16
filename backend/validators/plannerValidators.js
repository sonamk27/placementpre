import { body, param } from "express-validator";

const priorityValidator = () =>
  body("priority")
    .optional()
    .isIn(["High", "Medium", "Low"])
    .withMessage("Priority must be High, Medium, or Low");

const estimateValidator = () =>
  body("estimate")
    .optional()
    .trim()
    .isLength({ min: 1, max: 40 })
    .withMessage("Estimate must be between 1 and 40 characters");

const completedValidator = () =>
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be true or false")
    .toBoolean();

export const taskIdValidator = [
  param("taskId").isMongoId().withMessage("Task id is invalid"),
];

export const goalIdValidator = [
  param("goalId").isMongoId().withMessage("Goal id is invalid"),
];

export const createTaskValidator = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 160 })
    .withMessage("Task title must be between 2 and 160 characters"),
  priorityValidator(),
  estimateValidator(),
  completedValidator(),
];

export const updateTaskValidator = [
  ...taskIdValidator,
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 160 })
    .withMessage("Task title must be between 2 and 160 characters"),
  priorityValidator(),
  estimateValidator(),
  completedValidator(),
];

export const updateGoalValidator = [
  ...goalIdValidator,
  completedValidator(),
];
