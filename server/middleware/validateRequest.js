import { validationResult } from "express-validator";
import { HttpError } from "../utils/httpError.js";

export const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const details = result.array().map((error) => ({
    field: error.path,
    message: error.msg,
  }));

  return next(new HttpError(400, "Request validation failed", details));
};
