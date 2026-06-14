import { isDatabaseConnected } from "../config/database.js";
import { HttpError } from "../utils/httpError.js";

export const requireDatabase = (req, res, next) => {
  if (isDatabaseConnected()) {
    return next();
  }

  return next(
    new HttpError(
      503,
      "Database is not connected. Start MongoDB or set MONGODB_URI to a reachable MongoDB instance.",
    ),
  );
};
