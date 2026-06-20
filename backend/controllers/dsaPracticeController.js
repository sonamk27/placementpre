import { Types } from "mongoose";
import { isDatabaseConnected } from "../config/database.js";
import {
  buildDefaultDsaPracticePayload,
  completeTodayDsaPractice,
  getTodayDsaPractice,
} from "../services/dsaPracticeService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getUserId = (req) => new Types.ObjectId(req.user._id);

export const getTodayDsaPracticeController = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    return res.json(buildDefaultDsaPracticePayload(req.user?._id));
  }

  return res.json(await getTodayDsaPractice(getUserId(req)));
});

export const completeTodayDsaPracticeController = asyncHandler(async (req, res) => {
  if (!isDatabaseConnected()) {
    return res
      .status(202)
      .json(buildDefaultDsaPracticePayload(req.user?._id, new Date(), { completed: true }));
  }

  return res.json(await completeTodayDsaPractice(getUserId(req)));
});
