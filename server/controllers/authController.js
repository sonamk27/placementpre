import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { User } from "../models/User.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

const toAuthPayload = (user) => ({
  token: signToken(user),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
});

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email }).lean();

  if (existingUser) {
    throw new HttpError(409, "Email is already registered");
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  res.status(201).json(toAuthPayload(user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+passwordHash");

  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Invalid email or password");
  }

  res.json(toAuthPayload(user));
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
