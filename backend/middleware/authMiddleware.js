import jwt from "jsonwebtoken";
import { isDatabaseConnected } from "../config/database.js";
import { config } from "../config/env.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authenticateJwt = asyncHandler(async (req, res, next) => {
  const header = req.get("Authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new HttpError(401, "Authentication token is required");
  }

  const payload = jwt.verify(token, config.jwtSecret);
  const user = await User.findById(payload.sub).select("_id name email").lean();

  if (!user) {
    throw new HttpError(401, "Authenticated user no longer exists");
  }

  req.user = user;
  next();
});

const guestCommunicationUser = {
  _id: config.guestUserId,
  name: "Guest User",
  email: "guest@prepmate.local",
};

export const attachCommunicationUser = asyncHandler(async (req, res, next) => {
  const header = req.get("Authorization") || "";
  const [scheme, token] = header.split(" ");

  if (scheme === "Bearer" && token && isDatabaseConnected()) {
    try {
      const payload = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(payload.sub).select("_id name email").lean();

      if (user) {
        req.user = user;
        return next();
      }
    } catch {
      // Fall through to the guest user so Communication Coach stays open.
    }
  }

  req.user = guestCommunicationUser;
  return next();
});
